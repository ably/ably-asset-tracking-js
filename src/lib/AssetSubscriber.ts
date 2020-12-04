import { Types as AblyTypes } from 'ably';
import AssetConnection from './AssetConnection';
import Logger, { LoggerOptions } from './utils/Logger';

type GeoJsonMessage = unknown;

type LocationListener = (geoJsonMsg: GeoJsonMessage) => unknown;
type StatusListener = (isOnline: boolean) => unknown;

export type SubscriberOptions = {
  ablyOptions: AblyTypes.ClientOptions;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  onStatusUpdate?: StatusListener;
  loggerOptions?: LoggerOptions;
};

class AssetSubscriber {
  ablyOptions: AblyTypes.ClientOptions;
  onStatusUpdate?: StatusListener;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  logger: Logger;
  assetConnection?: AssetConnection;

  constructor(options: SubscriberOptions) {
    this.logger = new Logger(options.loggerOptions);
    this.ablyOptions = options.ablyOptions;
    this.onStatusUpdate = options.onStatusUpdate;
    this.onRawLocationUpdate = options.onRawLocationUpdate;
    this.onEnhancedLocationUpdate = options.onEnhancedLocationUpdate;
  }

  start(trackingId: string): void {
    this.assetConnection = new AssetConnection(
      this.logger,
      trackingId,
      this.ablyOptions,
      this.onRawLocationUpdate,
      this.onEnhancedLocationUpdate,
      this.onStatusUpdate
    );
  }

  stop(): void {
    this.assetConnection?.close?.();
    delete this.assetConnection;
  }
}

export default AssetSubscriber;
