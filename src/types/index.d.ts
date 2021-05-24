import { Feature, Point } from 'geojson';
import { Types as AblyTypes } from 'ably';
import { Accuracy, LocationUpdateType } from '../lib/constants';
import { LoggerOptions } from '../lib/utils/Logger';

export type SubscriberOptions = {
  /**
   * The configuration for Ably connection.
   */
  ablyOptions: AblyTypes.ClientOptions;

  /**
   * A callback to be notified when an enhanced location update is available.
   */
  onLocationUpdate?: LocationListener;

  /**
   * A callback to be notified when the online status of the asset changes.
   */
  onStatusUpdate?: StatusListener;

  /**
   * The logging configuration.
   */
  loggerOptions?: LoggerOptions;

  /**
   * The desired resolution of updates, to be requested from the remote publisher.
   */
  resolution?: Resolution;
};

type GeoJsonProperties = {
  accuracyHorizontal: number;
  altitude: number;
  bearing: number;
  speed: number;
  time: number;
};

export type Location = Feature<Point, GeoJsonProperties>;

export type LocationUpdate = {
  location: Location;
  intermediateLocations: Array<Location>;
  skippedLocations: Array<Location>;
  type: LocationUpdateType;
};

export type LocationListener = (locationUpdate: LocationUpdate) => unknown;

export type StatusListener = (isOnline: boolean) => unknown;

/**
 * Governs how often to sample locations, at what level of positional accuracy, and how often to send them to
 * subscribers.
 */
export type Resolution = {
  /**
   * The general priority for accuracy of location updates, used to govern any trade-off between power usage and
   * positional accuracy.
   *
   * The highest positional accuracy will be achieved by specifying `Accuracy.MAXIMUM`, but at the expense of
   * significantly increased power usage. Conversely, the lowest power usage will be achieved by specifying
   * `Accuracy.MINIMUM` but at the expense of significantly decreased positional accuracy.
   */
  accuracy: Accuracy;

  /**
   * Desired time between updates, in milliseconds. Lowering this value increases the temporal resolution.
   *
   * Location updates whose timestamp differs from the last captured update timestamp by less that this value are to
   * be filtered out.
   *
   * Used to govern the frequency of updates requested from the underlying location provider, as well as the frequency
   * of messages broadcast to subscribers.
   */
  desiredInterval: number;

  /**
   * Minimum positional granularity required, in metres. Lowering this value increases the spatial resolution.
   *
   * Location updates whose position differs from the last known position by a distance smaller than this value are to
   * be filtered out.
   *
   * Used to configure the underlying location provider, as well as to filter the broadcast of updates to subscribers.
   */
  minimumDisplacement: number;
};
