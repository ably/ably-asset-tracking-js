/**
 * The accuracy of a geographical coordinates sent by the asset publisher.
 *
 * Presents a unified representation of location accuracy (Apple) and quality priority (Android).
 */
export enum Accuracy {
  /**
   * - Android: [PRIORITY_NO_POWER](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest#PRIORITY_NO_POWER)
   *   (best possible with zero additional power consumption)
   * - Apple: [kCLLocationAccuracyReduced](https://developer.apple.com/documentation/corelocation/kcllocationaccuracyreduced)
   *   (preserves the user’s country, typically preserves the city, and is usually within 1–20 kilometers of the actual location)
   */
  Minimum = 'MINIMUM',

  /**
   * - Android: [PRIORITY_LOW_POWER](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest#PRIORITY_LOW_POWER)
   *   (coarse "city" level, circa 10km accuracy)
   * - Apple: Either [kCLLocationAccuracyKilometer](https://developer.apple.com/documentation/corelocation/kcllocationaccuracykilometer)
   *   or [kCLLocationAccuracyThreeKilometers](https://developer.apple.com/documentation/corelocation/kcllocationaccuracythreekilometers)
   */
  Low = 'LOW',

  /**
   * - Android: [PRIORITY_BALANCED_POWER_ACCURACY](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest#PRIORITY_BALANCED_POWER_ACCURACY)
   *   (coarse "block" level, circa 100m accuracy)
   * - Apple: Either [kCLLocationAccuracyNearestTenMeters](https://developer.apple.com/documentation/corelocation/kcllocationaccuracynearesttenmeters)
   *   or [kCLLocationAccuracyHundredMeters](https://developer.apple.com/documentation/corelocation/kcllocationaccuracyhundredmeters)
   */
  Balanced = 'BALANCED',

  /**
   * - Android: [PRIORITY_HIGH_ACCURACY](https://developers.google.com/android/reference/com/google/android/gms/location/LocationRequest#PRIORITY_HIGH_ACCURACY)
   *   (most accurate locations that are available)
   * - Apple: [kCLLocationAccuracyBest](https://developer.apple.com/documentation/corelocation/kcllocationaccuracybest)
   *   (very high accuracy but not to the same level required for navigation apps)
   */
  High = 'HIGH',

  /**
   * - Android: same as [HIGH]
   * - Apple: [kCLLocationAccuracyBestForNavigation](https://developer.apple.com/documentation/corelocation/kcllocationaccuracybestfornavigation)
   *   (precise position information required at all times, with significant extra power requirement implication)
   */
  Maximum = 'MAXIMUM',
}

export enum ClientTypes {
  Subscriber = 'SUBSCRIBER',
  Publisher = 'PUBLISHER',
}

export enum LocationUpdateType {
  Predicted = 'PREDICTED',
  Actual = 'ACTUAL',
}
