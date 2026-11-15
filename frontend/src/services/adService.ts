import { Alert, Platform } from 'react-native';
import { RewardedAd, RewardedAdEventType, AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../config/ads';

/**
 * Plays an AdMob Rewarded Video Ad when a user requests an extra photo slot (#2 to #5)
 * on Rent Houses or Kurnool Bazaar classified listings.
 *
 * If the user watches the video, `onSuccess()` is called to unlock the slot.
 * Includes graceful timeout / no-fill fallback so users are never blocked if AdMob has no fill.
 */
export const playRewardedAdForPhotoUnlock = async (
  onSuccess: () => void,
  onUserCancel?: () => void
): Promise<void> => {
  if (Platform.OS === 'web') {
    onSuccess();
    return;
  }

  try {
    const adUnitId = getAdUnitId('REWARDED_PHOTO_UNLOCK');
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let isRewardEarned = false;
    let hasShown = false;

    // Safety timeout: If AdMob takes > 6s or has no fill, gracefully allow photo pick
    const timeoutTimer = setTimeout(() => {
      if (!hasShown) {
        console.warn('Rewarded Ad load timeout, granting reward fallback.');
        isRewardEarned = true;
        onSuccess();
      }
    }, 6000);

    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      clearTimeout(timeoutTimer);
      hasShown = true;
      rewarded.show().catch(err => {
        console.warn('Error displaying rewarded ad, fallback to grant:', err);
        onSuccess();
      });
    });

    const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      isRewardEarned = true;
      onSuccess();
    });

    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      if (!isRewardEarned) {
        Alert.alert(
          'Video Incomplete',
          'Please watch the full sponsor video to unlock additional photo slots.'
        );
        if (onUserCancel) onUserCancel();
      }
    });

    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, err => {
      clearTimeout(timeoutTimer);
      console.warn('Rewarded ad failed to load, granting fallback:', err);
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
      onSuccess();
    });

    rewarded.load();
  } catch (err) {
    console.warn('playRewardedAdForPhotoUnlock error:', err);
    onSuccess();
  }
};

/**
 * Shows an Interstitial full-screen ad on key transition moments
 * (e.g. claiming a high-value discount or submitting a business listing).
 */
export const showInterstitialAd = async (onDone?: () => void): Promise<void> => {
  if (Platform.OS === 'web') {
    if (onDone) onDone();
    return;
  }

  try {
    const adUnitId = getAdUnitId('INTERSTITIAL');
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show().catch(() => {
        if (onDone) onDone();
      });
    });

    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubLoaded();
      unsubClosed();
      if (onDone) onDone();
    });

    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
      if (onDone) onDone();
    });

    interstitial.load();
  } catch (e) {
    if (onDone) onDone();
  }
};

