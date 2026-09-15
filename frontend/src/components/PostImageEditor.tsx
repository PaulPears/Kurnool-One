import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlipType, manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { captureRef } from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';

type EditorTool = 'crop' | 'text' | 'brush' | null;

type RelativePoint = {
  x: number;
  y: number;
};

type Stroke = {
  id: string;
  color: string;
  size: number;
  points: RelativePoint[];
};

type TextSticker = {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
};

type CropPreset = {
  id: string;
  label: string;
  ratio: number;
};

type PostImageEditorProps = {
  imageUri: string;
  onImageUriChange: (uri: string) => void;
};

export type PostImageEditorHandle = {
  exportImageAsync: () => Promise<string>;
  hasOverlayEdits: () => boolean;
};

const COLORS = ['#FFFFFF', '#111827', '#EF4444', '#F59E0B', '#10B981', '#2563EB'];
const BRUSH_SIZES = [4, 8, 12];
const CROP_PRESETS: CropPreset[] = [
  { id: 'square', label: 'Square', ratio: 1 },
  { id: 'portrait', label: 'Portrait', ratio: 4 / 5 },
  { id: 'story', label: 'Story', ratio: 9 / 16 },
  { id: 'wide', label: 'Wide', ratio: 16 / 9 },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const buildPath = (points: RelativePoint[], canvasWidth: number, canvasHeight: number) => {
  if (!points.length) return '';
  return points
    .map((point, index) => {
      const x = point.x * canvasWidth;
      const y = point.y * canvasHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const computeCenteredCrop = (width: number, height: number, targetRatio: number) => {
  const imageRatio = width / height;
  if (imageRatio > targetRatio) {
    const cropWidth = Math.round(height * targetRatio);
    return {
      originX: Math.round((width - cropWidth) / 2),
      originY: 0,
      width: cropWidth,
      height,
    };
  }

  const cropHeight = Math.round(width / targetRatio);
  return {
    originX: 0,
    originY: Math.round((height - cropHeight) / 2),
    width,
    height: cropHeight,
  };
};

type DraggableStickerProps = {
  canvasHeight: number;
  canvasWidth: number;
  onMove: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
  selected: boolean;
  sticker: TextSticker;
  visibleControls: boolean;
};

function DraggableSticker({
  canvasHeight,
  canvasWidth,
  onMove,
  onSelect,
  selected,
  sticker,
  visibleControls,
}: DraggableStickerProps) {
  const startPositionRef = useRef({ x: sticker.x, y: sticker.y });

  useEffect(() => {
    startPositionRef.current = { x: sticker.x, y: sticker.y };
  }, [sticker.x, sticker.y]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => visibleControls,
      onMoveShouldSetPanResponder: () => visibleControls,
      onPanResponderGrant: () => {
        startPositionRef.current = { x: sticker.x, y: sticker.y };
        onSelect(sticker.id);
      },
      onPanResponderMove: (_event, gestureState) => {
        if (!canvasWidth || !canvasHeight) return;
        const nextX = clamp(startPositionRef.current.x + gestureState.dx / canvasWidth, 0.03, 0.74);
        const nextY = clamp(startPositionRef.current.y + gestureState.dy / canvasHeight, 0.03, 0.86);
        onMove(sticker.id, nextX, nextY);
      },
      onPanResponderRelease: () => {
        startPositionRef.current = { x: sticker.x, y: sticker.y };
      },
    })
  ).current;

  return (
    <View
      {...responder.panHandlers}
      style={[
        styles.sticker,
        {
          left: sticker.x * canvasWidth,
          top: sticker.y * canvasHeight,
          borderColor: selected && visibleControls ? '#2563EB' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.stickerText, { color: sticker.color }]}>{sticker.text}</Text>
    </View>
  );
}

const PostImageEditor = forwardRef<PostImageEditorHandle, PostImageEditorProps>(
  ({ imageUri, onImageUriChange }, ref) => {
    const canvasRef = useRef<View | null>(null);
    const [activeTool, setActiveTool] = useState<EditorTool>(null);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
    const [working, setWorking] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [textDraft, setTextDraft] = useState('');
    const [textColor, setTextColor] = useState(COLORS[0]);
    const [brushColor, setBrushColor] = useState('#EF4444');
    const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
    const [textStickers, setTextStickers] = useState<TextSticker[]>([]);
    const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [draftStroke, setDraftStroke] = useState<Stroke | null>(null);

    useEffect(() => {
      let mounted = true;
      Image.getSize(
        imageUri,
        (width, height) => {
          if (mounted && width > 0 && height > 0) {
            setImageSize({ width, height });
          }
        },
        () => {
          if (mounted) {
            setImageSize({ width: 1, height: 1 });
          }
        }
      );

      return () => {
        mounted = false;
      };
    }, [imageUri]);

    useEffect(() => {
      setTextStickers([]);
      setSelectedStickerId(null);
      setStrokes([]);
      setDraftStroke(null);
      setActiveTool(null);
    }, [imageUri]);

    const hasOverlayEdits = textStickers.length > 0 || strokes.length > 0;

    const canvasHeight = useMemo(() => {
      if (!canvasWidth) return 320;
      return Math.max(260, (canvasWidth * imageSize.height) / imageSize.width);
    }, [canvasWidth, imageSize.height, imageSize.width]);

    const captureEditedImage = async () => {
      if (!hasOverlayEdits || !canvasRef.current) {
        return imageUri;
      }

      setIsCapturing(true);
      setSelectedStickerId(null);
      setActiveTool(null);
      Keyboard.dismiss();
      await wait(80);

      try {
        return await captureRef(canvasRef, {
          format: 'jpg',
          quality: 0.95,
          result: 'tmpfile',
          width: imageSize.width,
          height: imageSize.height,
        });
      } finally {
        setIsCapturing(false);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        exportImageAsync: captureEditedImage,
        hasOverlayEdits: () => hasOverlayEdits,
      }),
      [hasOverlayEdits, imageSize.height, imageSize.width, imageUri]
    );

    const confirmTransform = (handler: () => void) => {
      if (!hasOverlayEdits) {
        handler();
        return;
      }

      Alert.alert(
        'Replace current edits?',
        'Changing crop or rotation will clear the text and brush drawings on this photo.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', style: 'destructive', onPress: handler },
        ]
      );
    };

    const clearOverlays = () => {
      setTextStickers([]);
      setSelectedStickerId(null);
      setStrokes([]);
      setDraftStroke(null);
    };

    const runTransform = async (actions: Parameters<typeof manipulateAsync>[1]) => {
      try {
        setWorking(true);
        const result = await manipulateAsync(imageUri, actions, {
          compress: 0.95,
          format: SaveFormat.JPEG,
        });
        clearOverlays();
        onImageUriChange(result.uri);
      } finally {
        setWorking(false);
      }
    };

    const applyCropPreset = (preset: CropPreset) => {
      confirmTransform(() => {
        const crop = computeCenteredCrop(imageSize.width, imageSize.height, preset.ratio);
        void runTransform([{ crop }]);
      });
    };

    const rotateImage = (degrees: number) => {
      confirmTransform(() => {
        void runTransform([{ rotate: degrees }]);
      });
    };

    const flipImage = () => {
      confirmTransform(() => {
        void runTransform([{ flip: FlipType.Horizontal }]);
      });
    };

    const addTextSticker = () => {
      const trimmed = textDraft.trim();
      if (!trimmed) return;
      const stickerId = createId();
      setTextStickers((current) => [
        ...current,
        {
          id: stickerId,
          text: trimmed,
          color: textColor,
          x: 0.14,
          y: 0.44,
        },
      ]);
      setSelectedStickerId(stickerId);
      setTextDraft('');
      Keyboard.dismiss();
    };

    const removeSelectedSticker = () => {
      if (!selectedStickerId) return;
      setTextStickers((current) => current.filter((item) => item.id !== selectedStickerId));
      setSelectedStickerId(null);
    };

    const undoLastEdit = () => {
      if (draftStroke) {
        setDraftStroke(null);
        return;
      }

      if (selectedStickerId) {
        removeSelectedSticker();
        return;
      }

      if (strokes.length > 0) {
        setStrokes((current) => current.slice(0, -1));
        return;
      }

      if (textStickers.length > 0) {
        setTextStickers((current) => current.slice(0, -1));
      }
    };

    const handleCanvasLayout = (event: LayoutChangeEvent) => {
      const nextWidth = event.nativeEvent.layout.width;
      if (nextWidth !== canvasWidth) {
        setCanvasWidth(nextWidth);
      }
    };

    const drawingResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => activeTool === 'brush',
          onMoveShouldSetPanResponder: () => activeTool === 'brush',
          onPanResponderGrant: (event) => {
            if (activeTool !== 'brush' || !canvasWidth || !canvasHeight) return;
            const { locationX, locationY } = event.nativeEvent;
            setSelectedStickerId(null);
            setDraftStroke({
              id: createId(),
              color: brushColor,
              size: brushSize,
              points: [
                {
                  x: clamp(locationX / canvasWidth, 0, 1),
                  y: clamp(locationY / canvasHeight, 0, 1),
                },
              ],
            });
          },
          onPanResponderMove: (event) => {
            if (activeTool !== 'brush' || !canvasWidth || !canvasHeight) return;
            const { locationX, locationY } = event.nativeEvent;
            const point = {
              x: clamp(locationX / canvasWidth, 0, 1),
              y: clamp(locationY / canvasHeight, 0, 1),
            };
            setDraftStroke((current) => {
              if (!current) return current;
              return {
                ...current,
                points: [...current.points, point],
              };
            });
          },
          onPanResponderRelease: () => {
            setDraftStroke((current) => {
              if (current && current.points.length > 1) {
                setStrokes((existing) => [...existing, current]);
              }
              return null;
            });
          },
          onPanResponderTerminate: () => {
            setDraftStroke(null);
          },
        }),
      [activeTool, brushColor, brushSize, canvasHeight, canvasWidth]
    );

    return (
      <View style={styles.editorCard}>
        <View style={styles.editorHeader}>
          <View>
            <Text style={styles.editorTitle}>Photo Editor</Text>
            <Text style={styles.editorSubtitle}>
              Crop, add text, draw with the brush, then post the final image.
            </Text>
          </View>
          {hasOverlayEdits ? (
            <TouchableOpacity onPress={undoLastEdit} style={styles.undoButton}>
              <Ionicons name="arrow-undo" size={16} color="#1D4ED8" />
              <Text style={styles.undoButtonText}>Undo</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.canvasFrame}>
          <View
            ref={canvasRef}
            collapsable={false}
            onLayout={handleCanvasLayout}
            style={[styles.canvas, { height: canvasHeight }]}
          >
            <Image source={{ uri: imageUri }} style={styles.canvasImage} resizeMode="cover" />

            <Svg pointerEvents="none" style={StyleSheet.absoluteFillObject}>
              {strokes.map((stroke) => (
                <Path
                  key={stroke.id}
                  d={buildPath(stroke.points, canvasWidth, canvasHeight)}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {draftStroke ? (
                <Path
                  d={buildPath(draftStroke.points, canvasWidth, canvasHeight)}
                  stroke={draftStroke.color}
                  strokeWidth={draftStroke.size}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : null}
            </Svg>

            {textStickers.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                canvasHeight={canvasHeight}
                canvasWidth={canvasWidth}
                onMove={(id, x, y) =>
                  setTextStickers((current) =>
                    current.map((item) => (item.id === id ? { ...item, x, y } : item))
                  )
                }
                onSelect={setSelectedStickerId}
                selected={selectedStickerId === sticker.id}
                sticker={sticker}
                visibleControls={!isCapturing && activeTool !== 'brush'}
              />
            ))}

            <View
              pointerEvents={activeTool === 'brush' ? 'auto' : 'none'}
              style={StyleSheet.absoluteFillObject}
              {...drawingResponder.panHandlers}
            />

            {working ? (
              <View style={styles.canvasOverlay}>
                <Ionicons name="images-outline" size={28} color="#FFFFFF" />
                <Text style={styles.canvasOverlayText}>Applying changes...</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={() => setActiveTool(activeTool === 'crop' ? null : 'crop')}
            style={[styles.toolButton, activeTool === 'crop' && styles.toolButtonActive]}
          >
            <Ionicons name="crop-outline" size={18} color={activeTool === 'crop' ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.toolButtonText, activeTool === 'crop' && styles.toolButtonTextActive]}>Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            style={[styles.toolButton, activeTool === 'text' && styles.toolButtonActive]}
          >
            <Ionicons name="text-outline" size={18} color={activeTool === 'text' ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.toolButtonText, activeTool === 'text' && styles.toolButtonTextActive]}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTool(activeTool === 'brush' ? null : 'brush')}
            style={[styles.toolButton, activeTool === 'brush' && styles.toolButtonActive]}
          >
            <Ionicons name="brush-outline" size={18} color={activeTool === 'brush' ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.toolButtonText, activeTool === 'brush' && styles.toolButtonTextActive]}>Brush</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTool(null)} style={styles.doneButton}>
            <Ionicons name="checkmark-outline" size={18} color="#1D4ED8" />
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {activeTool === 'crop' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Quick crop presets</Text>
            <View style={styles.choiceRow}>
              {CROP_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => applyCropPreset(preset)}
                  style={styles.choiceChip}
                >
                  <Text style={styles.choiceChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.choiceRow}>
              <TouchableOpacity onPress={() => rotateImage(-90)} style={styles.iconChip}>
                <Ionicons name="arrow-undo-outline" size={18} color="#1F2937" />
                <Text style={styles.iconChipText}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => rotateImage(90)} style={styles.iconChip}>
                <Ionicons name="arrow-redo-outline" size={18} color="#1F2937" />
                <Text style={styles.iconChipText}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={flipImage} style={styles.iconChip}>
                <Ionicons name="swap-horizontal-outline" size={18} color="#1F2937" />
                <Text style={styles.iconChipText}>Flip</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {activeTool === 'text' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Write on the image</Text>
            <TextInput
              style={styles.textInput}
              value={textDraft}
              onChangeText={setTextDraft}
              placeholder="Type your text"
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <View style={styles.colorRow}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setTextColor(color)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color, borderColor: textColor === color ? '#2563EB' : '#E5E7EB' },
                  ]}
                />
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={addTextSticker} style={styles.primaryActionButton}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Add Text</Text>
              </TouchableOpacity>
              {selectedStickerId ? (
                <TouchableOpacity onPress={removeSelectedSticker} style={styles.secondaryActionButton}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.secondaryActionText}>Remove Selected</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        {activeTool === 'brush' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Draw with the brush</Text>
            <View style={styles.colorRow}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setBrushColor(color)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color, borderColor: brushColor === color ? '#2563EB' : '#E5E7EB' },
                  ]}
                />
              ))}
            </View>

            <View style={styles.choiceRow}>
              {BRUSH_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setBrushSize(size)}
                  style={[styles.sizeChip, brushSize === size && styles.sizeChipActive]}
                >
                  <Text style={[styles.sizeChipText, brushSize === size && styles.sizeChipTextActive]}>
                    {size}px
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.helperText}>
          Drag added text to place it where you want. Brush strokes are saved into the posted image.
        </Text>
      </View>
    );
  }
);

PostImageEditor.displayName = 'PostImageEditor';

export default PostImageEditor;

const styles = StyleSheet.create({
  editorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 24,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  editorSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    maxWidth: 250,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  undoButtonText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 13,
  },
  canvasFrame: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  canvas: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#111827',
  },
  canvasImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  canvasOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  canvasOverlayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  toolButtonActive: {
    backgroundColor: '#2563EB',
  },
  toolButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  toolButtonTextActive: {
    color: '#FFFFFF',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
  },
  doneButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  panel: {
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 2,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  iconChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  textInput: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#2563EB',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  secondaryActionText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sizeChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sizeChipText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 13,
  },
  sizeChipTextActive: {
    color: '#FFFFFF',
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  sticker: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(17, 24, 39, 0.22)',
    maxWidth: 220,
  },
  stickerText: {
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
