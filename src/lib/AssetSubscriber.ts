import Ably, { Types as AblyTypes } from 'ably';
import Logger, { LoggerOptions } from './utils/Logger';

type GeoJsonMessage = unknown;

type LocationListener = (geoJsonMsg: GeoJsonMessage) => unknown;
type StatusListener = (isOnline: boolean) => unknown;

export type SubscriberOptions = {
  ablyOptions: AblyTypes.ClientOptions;
  trackingId: string;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  onStatusUpdate?: StatusListener;
  loggerOptions?: LoggerOptions;
};

enum EventNames {
  raw = 'raw',
  enhanced = 'enhanced',
}

enum ClientTypes {
  subscriber = 'subscriber',
  publisher = 'publisher',
}

class AssetSubscriber {
  trackingId: string;
  ablyOptions: AblyTypes.ClientOptions;
  ably: AblyTypes.RealtimePromise;
  channel: AblyTypes.RealtimeChannelPromise;
  onStatusUpdate?: StatusListener;
  logger: Logger;

  constructor(options: SubscriberOptions) {
    this.logger = new Logger(options.loggerOptions);
    this.trackingId = options.trackingId;
    this.ablyOptions = options.ablyOptions;
    this.ably = new Ably.Realtime.Promise(this.ablyOptions);
    this.channel = this.ably.channels.get(this.trackingId, {
      params: { rewind: '1' },
    });
    this.onStatusUpdate = options.onStatusUpdate;
    this.joinChannelPresence();

    if (options.onRawLocationUpdate) {
      this.subscribeForRawEvents(options.onRawLocationUpdate);
    }

    if (options.onEnhancedLocationUpdate) {
      this.subscribeForEnhancedEvents(options.onEnhancedLocationUpdate);
    }
  }

  stop(): void {
    this.channel.unsubscribe();
    this.leaveChannelPresence();
    this.ably.close();
  }

  private subscribeForRawEvents(rawLocationListener: LocationListener) {
    this.channel.subscribe(EventNames.raw, (message) => {
      message.data.forEach(rawLocationListener);
    });
  }

  private subscribeForEnhancedEvents(enhancedLocationListener: LocationListener) {
    this.channel.subscribe(EventNames.raw, (message) => {
      message.data.forEach(enhancedLocationListener);
    });
  }

  private async joinChannelPresence() {
    if (!this.ablyOptions.clientId) {
      this.logger.logError('No clientId provided.');
      throw new Error('No clientId provided.');
    }
    this.channel.presence.subscribe(this.onPresenceMessage);
    this.channel.presence.enterClient(this.ablyOptions.clientId, ClientTypes.subscriber).catch((reason) => {
      this.logger.logError(`Error entering channel presence: ${reason}`);
      throw new Error(reason);
    });
  }

  private leaveChannelPresence() {
    if (!this.ablyOptions.clientId) {
      this.logger.logError('No clientId provided.');
      throw new Error('No clientId provided.');
    }
    this.channel.presence.unsubscribe();
    this.notifyAssetIsOffline();
    this.channel.presence.leaveClient(this.ablyOptions.clientId, ClientTypes.subscriber).catch((reason) => {
      this.logger.logError(`Error leaving channel presence: ${reason}`);
      throw new Error(reason);
    });
  }

  private onPresenceMessage(presenceMessage: AblyTypes.PresenceMessage) {
    if (presenceMessage.data.type === ClientTypes.publisher) {
      if (presenceMessage.action === 'enter') {
        this.notifyAssetIsOnline();
      } else if (presenceMessage.action === 'leave') {
        this.notifyAssetIsOffline();
      }
    }
  }

  private notifyAssetIsOnline() {
    this?.onStatusUpdate?.(true);
  }

  private notifyAssetIsOffline() {
    this?.onStatusUpdate?.(false);
  }
}

export default AssetSubscriber;
