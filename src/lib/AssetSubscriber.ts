import { Types as AblyTypes } from 'ably';
import { LocationListener, Resolution, StatusListener } from '../types';
import AssetConnection from './AssetConnection';
import Logger, { LoggerOptions } from './utils/Logger';

export type SubscriberOptions = {
  ablyOptions: AblyTypes.ClientOptions;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  onStatusUpdate?: StatusListener;
  loggerOptions?: LoggerOptions;
  resolution?: Resolution;
};

class AssetSubscriber {
  ablyOptions: AblyTypes.ClientOptions;
  onStatusUpdate?: StatusListener;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  logger: Logger;
  assetConnection?: AssetConnection;
  resolution?: Resolution;

  constructor(options: SubscriberOptions) {
    this.logger = new Logger(options.loggerOptions);
    this.ablyOptions = options.ablyOptions;
    this.onStatusUpdate = options.onStatusUpdate;
    this.onRawLocationUpdate = options.onRawLocationUpdate;
    this.onEnhancedLocationUpdate = options.onEnhancedLocationUpdate;
    this.resolution = options.resolution;
  }

  start(trackingId: string): void {
    this.assetConnection = new AssetConnection(
      this.logger,
      trackingId,
      this.ablyOptions,
      this.onRawLocationUpdate,
      this.onEnhancedLocationUpdate,
      this.onStatusUpdate,
      this.resolution
    );
  }

  sendChangeRequest(resolution: Resolution, onSuccess: () => unknown, onError: (err: Error) => unknown): void {
    this.resolution = resolution;
    if (!this.assetConnection) {
      onError(new Error('Cannot change resolution; no asset is currently being tracked.'));
    } else {
      this.assetConnection.performChangeResolution(resolution, onSuccess, onError);
    }
  }

  stop = async (): Promise<void> => {
    await this.assetConnection?.close?.();
    delete this.assetConnection;
  };
}

export default AssetSubscriber;
