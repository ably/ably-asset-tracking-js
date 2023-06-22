import Ably, { Types } from 'ably';
import { EventNames } from '../../../src/lib/AssetConnection';
import { ClientTypes } from '../../../src/lib/constants';

export class MockPublisher {
  ably: Types.RealtimePromise;

  constructor(key: string) {
    this.ably = new Ably.Realtime.Promise({ key, clientId: 'mock-publisher', environment: 'sandbox' });
  }

  sendRawMessage = async (trackingId: string, message: unknown): Promise<void> => {
    await this.getChannelFromTrackingId(trackingId).publish(EventNames.Raw, message);
  };

  sendEnhancedMessage = async (trackingId: string, message: unknown): Promise<void> => {
    await this.getChannelFromTrackingId(trackingId).publish(EventNames.Enhanced, message);
  };

  onSubscriberPresenceEnter = (trackingId: string, cb: (data: Types.PresenceMessage) => void): void => {
    this.getChannelFromTrackingId(trackingId).presence.subscribe('enter', (message) => {
      if (message.data.type === ClientTypes.Subscriber) cb(message);
    });
  };

  onSubscriberPresenceUpdate = (trackingId: string, cb: (data: Types.PresenceMessage) => void): void => {
    this.getChannelFromTrackingId(trackingId).presence.subscribe('update', (message) => {
      if (message.data.type === ClientTypes.Subscriber) cb(message);
    });
  };

  onSubscriberPresenceLeave = (trackingId: string, cb: () => void): void => {
    this.getChannelFromTrackingId(trackingId).presence.subscribe('leave', (message) => {
      if (message.data.type === ClientTypes.Subscriber) cb();
    });
  };

  enterPresence = async (trackingId: string): Promise<void> => {
    await this.getChannelFromTrackingId(trackingId).presence.enter({ type: ClientTypes.Publisher });
  };

  leavePresence = async (trackingId: string): Promise<void> => {
    await this.getChannelFromTrackingId(trackingId).presence.leave();
  };

  private getChannelFromTrackingId = (trackingId: string): Types.RealtimeChannelPromise => {
    return this.ably.channels.get(`tracking:${trackingId}`);
  };
}

export const getRandomChannelName = (): string => Math.random().toString();
