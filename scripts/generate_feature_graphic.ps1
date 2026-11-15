Add-Type -AssemblyName System.Drawing

$width = 1024
$height = 500
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

function Add-RoundedRectPath([System.Drawing.Drawing2D.GraphicsPath]$path, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r) {
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
}

# 1. Background gradient (Clean modern subtle tech gradient)
$bgRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$topColor = [System.Drawing.ColorTranslator]::FromHtml('#F8FAFC')
$botColor = [System.Drawing.ColorTranslator]::FromHtml('#E2E8F0')
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, $topColor, $botColor, 90.0)
$g.FillRectangle($bgBrush, $bgRect)
$bgBrush.Dispose()

# Ambient blue soft glow in center
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse(212, 50, 600, 400)
$pbg = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$pbg.CenterColor = [System.Drawing.Color]::FromArgb(45, 37, 99, 235)
$pbg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 248, 250, 252))
$g.FillPath($pbg, $glowPath)
$pbg.Dispose()
$glowPath.Dispose()

# 2. Draw Logo Card (White rounded card with subtle shadow and border)
$cardSize = 136
$cardX = [int](($width - $cardSize) / 2)
$cardY = 36
$cardRadius = 22

# Soft shadow
$shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRectPath $shadowPath ($cardX - 4) ($cardY + 3) ($cardSize + 8) ($cardSize + 8) ($cardRadius + 2)
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 15, 23, 42))
$g.FillPath($shadowBrush, $shadowPath)
$shadowBrush.Dispose()
$shadowPath.Dispose()

# White card background
$cardPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRectPath $cardPath $cardX $cardY $cardSize $cardSize $cardRadius
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillPath($cardBrush, $cardPath)
$cardBrush.Dispose()

# Card border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#CBD5E1'), 1.5)
$g.DrawPath($borderPen, $cardPath)
$borderPen.Dispose()
$cardPath.Dispose()

# Draw actual logo.png inside card
$logoPath = "G:\Kurnool One\Kurnool One\frontend\assets\logo.png"
$logoImg = [System.Drawing.Image]::FromFile($logoPath)
$logoPad = 12
$lx = [int]($cardX + $logoPad)
$ly = [int]($cardY + $logoPad)
$lw = [int]($cardSize - (2 * $logoPad))
$lh = [int]($cardSize - (2 * $logoPad))
$g.DrawImage($logoImg, $lx, $ly, $lw, $lh)
$logoImg.Dispose()

# 3. Typography
# Title: Kurnool One
$titleFont = New-Object System.Drawing.Font('Arial', 38, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#0F172A'))
$titleText = 'Kurnool One'
$titleSize = $g.MeasureString($titleText, $titleFont)
$titleX = [int](($width - $titleSize.Width) / 2)
$titleY = [int]($cardY + $cardSize + 12)
$g.DrawString($titleText, $titleFont, $titleBrush, $titleX, $titleY)
$titleFont.Dispose()
$titleBrush.Dispose()

# Telugu subtitle: కర్నూలు వన్
$teFont = New-Object System.Drawing.Font('Nirmala UI', 20, [System.Drawing.FontStyle]::Bold)
$teBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#2563EB'))
$teText = -join ([char]0x0C15, [char]0x0C30, [char]0x0C4D, [char]0x0C28, [char]0x0C42, [char]0x0C32, [char]0x0C41, ' ', [char]0x0C35, [char]0x0C28, [char]0x0C4D)
$teSize = $g.MeasureString($teText, $teFont)
$teX = [int](($width - $teSize.Width) / 2)
$teY = [int]($titleY + $titleSize.Height - 6)
$g.DrawString($teText, $teFont, $teBrush, $teX, $teY)
$teFont.Dispose()
$teBrush.Dispose()

# 4. Tagline Pill: Everything in One App
$pillFont = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Bold)
$pillText = 'Everything in One App'
$pillTextSize = $g.MeasureString($pillText, $pillFont)
$pillW = [int]($pillTextSize.Width + 40)
$pillH = 34
$pillX = [int](($width - $pillW) / 2)
$pillY = [int]($teY + $teSize.Height + 10)

$pillPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRectPath $pillPath $pillX $pillY $pillW $pillH 17
$pillBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#DBEAFE'))
$g.FillPath($pillBgBrush, $pillPath)
$pillBgBrush.Dispose()

$pillBorderPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#93C5FD'), 1.5)
$g.DrawPath($pillBorderPen, $pillPath)
$pillBorderPen.Dispose()
$pillPath.Dispose()

$pillTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#1D4ED8'))
$g.DrawString($pillText, $pillFont, $pillTextBrush, ($pillX + 20), ($pillY + 7))
$pillFont.Dispose()
$pillTextBrush.Dispose()

# 5. Bottom 3 Value Props
$bottomFont = New-Object System.Drawing.Font('Arial', 12, [System.Drawing.FontStyle]::Bold)
$items = @('Local Shops', 'Skilled Professionals', 'City Services')
$itemWidths = @()
$totalItemsWidth = 0
foreach ($it in $items) {
    $sz = $g.MeasureString($it, $bottomFont)
    $w = [int]($sz.Width + 32)
    $itemWidths += $w
    $totalItemsWidth += $w
}
$spacing = 16
$totalBarWidth = $totalItemsWidth + ($spacing * ($items.Count - 1))
$curX = [int](($width - $totalBarWidth) / 2)
$bottomY = [int]($pillY + $pillH + 16)

for ($i = 0; $i -lt $items.Count; $i++) {
    $itW = $itemWidths[$i]
    $itH = 30
    
    $itPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    Add-RoundedRectPath $itPath $curX $bottomY $itW $itH 15
    
    $itBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($itBrush, $itPath)
    $itBrush.Dispose()
    
    $itPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#CBD5E1'), 1.0)
    $g.DrawPath($itPen, $itPath)
    $itPen.Dispose()
    $itPath.Dispose()
    
    $itTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#475569'))
    $g.DrawString($items[$i], $bottomFont, $itTextBrush, ($curX + 16), ($bottomY + 6))
    $itTextBrush.Dispose()
    
    $curX += ($itW + $spacing)
}
$bottomFont.Dispose()

# Save final graphic
$outPath = 'G:\Kurnool One\Kurnool One\kurnool_one_feature_graphic_1024x500.png'
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Host "SUCCESS: Official branded graphic generated at $outPath"
