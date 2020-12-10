import Ably, { Types as AblyTypes } from 'ably';
import { LocationListener, StatusListener } from '../types';
import Logger from './utils/Logger';

enum EventNames {
  raw = 'raw',
  enhanced = 'enhanced',
}

enum ClientTypes {
  subscriber = 'subscriber',
  publisher = 'publisher',
}

class AssetConnection {
  logger: Logger;
  ably: AblyTypes.RealtimePromise;
  channel: AblyTypes.RealtimeChannelPromise;
  trackingId: string;
  onRawLocationUpdate?: LocationListener;
  onEnhancedLocationUpdate?: LocationListener;
  onStatusUpdate?: StatusListener;

  constructor(
    logger: Logger,
    trackingId: string,
    ablyOptions: AblyTypes.ClientOptions,
    onRawLocationUpdate?: LocationListener,
    onEnhancedLocationUpdate?: LocationListener,
    onStatusUpdate?: StatusListener
  ) {
    this.logger = logger;
    this.trackingId = trackingId;
    this.onRawLocationUpdate = onRawLocationUpdate;
    this.onEnhancedLocationUpdate = onEnhancedLocationUpdate;
    this.onStatusUpdate = onStatusUpdate;

    this.ably = new Ably.Realtime.Promise(ablyOptions);
    this.channel = this.ably.channels.get(trackingId, {
      params: { rewind: '1' },
    });

    this.joinChannelPresence();

    if (this.onRawLocationUpdate) {
      this.subscribeForRawEvents(this.onRawLocationUpdate);
    }

    if (this.onEnhancedLocationUpdate) {
      this.subscribeForEnhancedEvents(this.onEnhancedLocationUpdate);
    }
  }

  close = async (): Promise<void> => {
    this.channel.unsubscribe();
    await this.leaveChannelPresence();
    this.ably.close();
  };

  private subscribeForRawEvents = (rawLocationListener: LocationListener) => {
    this.channel.subscribe(EventNames.raw, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach(rawLocationListener);
      } else {
        rawLocationListener(parsedMessage);
      }
    });
  };

  private subscribeForEnhancedEvents = (enhancedLocationListener: LocationListener) => {
    this.channel.subscribe(EventNames.enhanced, (message) => {
      const parsedMessage = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
      if (Array.isArray(parsedMessage)) {
        parsedMessage.forEach(enhancedLocationListener);
      } else {
        enhancedLocationListener(parsedMessage);
      }
    });
  };

  private joinChannelPresence = async () => {
    this.channel.presence.subscribe(this.onPresenceMessage);
    this.channel.presence.enterClient(this.ably.auth.clientId, ClientTypes.subscriber).catch((reason) => {
      this.logger.logError(`Error entering channel presence: ${reason}`);
      throw new Error(reason);
    });
  };

  private leaveChannelPresence = async () => {
    this.channel.presence.unsubscribe();
    this.notifyAssetIsOffline();
    try {
      await this.channel.presence.leaveClient(this.ably.auth.clientId, ClientTypes.subscriber);
    } catch (e) {
      this.logger.logError(`Error leaving channel presence: ${e.reason}`);
      throw new Error(e.reason);
    }
  };

  private onPresenceMessage = (presenceMessage: AblyTypes.PresenceMessage) => {
    if (presenceMessage.data?.type === ClientTypes.publisher) {
      if (presenceMessage.action === 'enter') {
        this.notifyAssetIsOnline();
      } else if (presenceMessage.action === 'leave') {
        this.notifyAssetIsOffline();
      }
    }
  };

  private notifyAssetIsOnline = () => {
    this?.onStatusUpdate?.(true);
  };

  private notifyAssetIsOffline = () => {
    this?.onStatusUpdate?.(false);
  };
}

export default AssetConnection;
