import Ably, { Types } from 'ably';
import { EventNames } from '../../../src/lib/AssetConnection';
import { ClientTypes } from '../../../src/lib/constants';

export class MockPublisher {
  ably: Types.RealtimePromise;

  constructor(key: string) {
    this.ably = new Ably.Realtime.Promise({ key, clientId: 'mock-publisher', environment: 'sandbox' });
  }

  sendRawMessage = async (channel: string, message: unknown): Promise<void> => {
    await this.ably.channels.get(channel).publish(EventNames.Raw, message);
  };

  sendEnhancedMessage = async (channel: string, message: unknown): Promise<void> => {
    await this.ably.channels.get(channel).publish(EventNames.Enhanced, message);
  };

  onSubscriberPresenceEnter = (channel: string, cb: (data: Types.PresenceMessage) => void): void => {
    this.ably.channels.get(channel).presence.subscribe('enter', (message) => {
      if (message.data.type === ClientTypes.Subscriber) cb(message);
    });
  }

  onSubscriberPresenceUpdate = (channel: string, cb: (data: Types.PresenceMessage) => void): void => {
    this.ably.channels.get(channel).presence.subscribe('update', (message) => {
      if (message.data.type === ClientTypes.Subscriber) cb(message);
    });
  }

  onSubscriberPresenceLeave = (channel: string, cb: () => void): void => {
    this.ably.channels.get(channel).presence.subscribe('leave', (message) => {
      if (message.data.type === ClientTypes.Subscriber) cb();
    });
  }

  enterPresence = async (channel: string): Promise<void> => {
    await this.ably.channels.get(channel).presence.enter({ type: ClientTypes.Publisher });
  }

  leavePresence = async (channel: string): Promise<void> => {
    await this.ably.channels.get(channel).presence.leave();
  }
}

export const getRandomChannelName = (): string => Math.random().toString();
