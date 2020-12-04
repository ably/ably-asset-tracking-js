import Ably, { Types as AblyTypes } from 'ably';
import { Feature as GeoJsonFeature, Point } from 'geojson';
import Logger from './utils/Logger';

type GeoJsonMessage = GeoJsonFeature<Point>;
type LocationListener = (geoJsonMsg: GeoJsonMessage) => unknown;
type StatusListener = (isOnline: boolean) => unknown;

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
  clientId: string;
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

    if (!ablyOptions.clientId) {
      logger.logError('ablyOptions.clientId must be provided');
      throw new Error('ablyOptions.clientId must be provided');
    }

    this.clientId = ablyOptions.clientId;
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

  close(): void {
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
    this.channel.presence.subscribe(this.onPresenceMessage);
    this.channel.presence.enterClient(this.clientId, ClientTypes.subscriber).catch((reason) => {
      this.logger.logError(`Error entering channel presence: ${reason}`);
      throw new Error(reason);
    });
  }

  private leaveChannelPresence() {
    this.channel.presence.unsubscribe();
    this.notifyAssetIsOffline();
    this.channel.presence.leaveClient(this.clientId, ClientTypes.subscriber).catch((reason) => {
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

export default AssetConnection;
