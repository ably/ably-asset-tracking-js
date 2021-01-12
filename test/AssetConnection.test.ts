import { Types } from 'ably';
import AssetConnection, { EventNames } from '../src/lib/AssetConnection';
import Logger from '../src/lib/utils/Logger';
import { ClientTypes } from '../src/types';
import { setImmediate } from '../src/lib/utils/utils';
import { mocked } from 'ts-jest/utils';

const mockAblyRealtimePromise = jest.fn(); // mocked Ably.Realtime.Promise constructor
const mockPresenceSubscribe = jest.fn();
const mockPresenceUnsubscribe = jest.fn();
const mockLeaveClient = jest.fn();
const mockEnterClient = jest.fn();
const mockChannelsGet = jest.fn();
const mockChannelSubscribe = jest.fn();
const mockPresenceUpdate = jest.fn();
const mockChannelUnsubscribe = jest.fn();
const mockClose = jest.fn();
const mockSetImmediate = mocked(setImmediate);

const trackingId = 'trackingId';
const clientId = 'clientId';
const ablyOptions = {};

jest.mock('../src/lib/utils/utils');
jest.mock('ably', () => ({
  Realtime: {
    Promise: (options: Types.ClientOptions) => mockAblyRealtimePromise(options),
  },
}));

describe('AssetConnection', () => {
  beforeEach(() => {
    mockChannelsGet.mockImplementation(() => ({
      presence: {
        subscribe: mockPresenceSubscribe,
        unsubscribe: mockPresenceUnsubscribe,
        update: mockPresenceUpdate,
        enterClient: mockEnterClient,
        leaveClient: mockLeaveClient,
      },
      subscribe: mockChannelSubscribe,
      unsubscribe: mockChannelUnsubscribe,
    }));
    mockEnterClient.mockResolvedValue(undefined);
    mockAblyRealtimePromise.mockImplementation(() => ({
      channels: {
        get: mockChannelsGet,
      },
      auth: {
        clientId,
      },
      close: mockClose,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create a new Ably.Realtime.Promise when constructor is called', () => {
    new AssetConnection(new Logger(), trackingId, ablyOptions);

    expect(mockAblyRealtimePromise).toHaveBeenCalledWith(ablyOptions);
  });

  it('should call ably.realtime.channels.get() with rewind=1 when constructor is called', () => {
    new AssetConnection(new Logger(), trackingId, ablyOptions);

    expect(mockChannelsGet).toHaveBeenCalledTimes(1);
    expect(mockChannelsGet).toHaveBeenCalledWith(trackingId, {
      params: {
        rewind: '1',
      },
    });
  });

  it('should subscribe to presence events when constructor is called', () => {
    new AssetConnection(new Logger(), trackingId, ablyOptions);

    expect(mockPresenceSubscribe).toHaveBeenCalledTimes(1);
  });

  it('should enter channel presence with correct params when constructor is called', () => {
    const resolution = {
      accuracy: 2,
      desiredInterval: 3,
      minimumDisplacement: 4,
    };
    new AssetConnection(new Logger(), trackingId, ablyOptions, undefined, undefined, undefined, resolution);

    expect(mockEnterClient).toHaveBeenCalledTimes(1);
    expect(mockEnterClient).toHaveBeenCalledWith(clientId, { type: ClientTypes.Subscriber, resolution });
  });

  it('should subscribe to raw and enhanced events when rawLocationListener and enhancedLocationListener are supplied', () => {
    new AssetConnection(new Logger(), trackingId, ablyOptions, jest.fn(), jest.fn());

    expect(mockChannelSubscribe).toHaveBeenCalledTimes(2);
    expect(mockChannelSubscribe).toHaveBeenNthCalledWith(1, EventNames.Raw, expect.any(Function));
    expect(mockChannelSubscribe).toHaveBeenNthCalledWith(2, EventNames.Enhanced, expect.any(Function));
  });

  it('should call onStatusUpdate with true when publisher enters channel presence', () => {
    const onStatusUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
      },
      action: 'enter',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));
    new AssetConnection(new Logger(), trackingId, ablyOptions, undefined, undefined, onStatusUpdate);

    expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusUpdate).toHaveBeenCalledWith(true);
  });

  it('should call onStatusUpdate with false when publisher leaves channel presence', () => {
    const onStatusUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
      },
      action: 'leave',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));
    new AssetConnection(new Logger(), trackingId, ablyOptions, undefined, undefined, onStatusUpdate);

    expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusUpdate).toHaveBeenCalledWith(false);
  });

  it('should execute rawLocationListener with location message when publisher publishes raw location message', () => {
    const rawLocationListener = jest.fn();
    const locationMessage = {
      data: {
        stub: 'message',
      },
    };

    mockChannelSubscribe.mockImplementation((_, fn) => fn(locationMessage));
    mockSetImmediate.mockImplementation((fn) => fn());

    new AssetConnection(new Logger(), trackingId, ablyOptions, rawLocationListener);

    expect(rawLocationListener).toHaveBeenCalledTimes(1);
    expect(rawLocationListener).toHaveBeenCalledWith(locationMessage.data);
  });

  it('should execute rawLocationListener with location messages when publisher publishes raw location message array', () => {
    const rawLocationListener = jest.fn();
    const locationMessages = {
      data: [
        {
          stub: 'message',
        },
        {
          other: 'message',
        },
      ],
    };

    mockChannelSubscribe.mockImplementation((_, fn) => fn(locationMessages));
    mockSetImmediate.mockImplementation((fn) => fn());

    new AssetConnection(new Logger(), trackingId, ablyOptions, rawLocationListener);

    expect(rawLocationListener).toHaveBeenCalledTimes(2);
    expect(rawLocationListener).toHaveBeenNthCalledWith(1, locationMessages.data[0]);
    expect(rawLocationListener).toHaveBeenNthCalledWith(2, locationMessages.data[1]);
  });

  it('should execute enhancedLocationListener with location message when publisher publishes enhanced location message', () => {
    const enhancedLocationListener = jest.fn();
    const locationMessage = {
      data: {
        stub: 'message',
      },
    };

    mockChannelSubscribe.mockImplementation((_, fn) => fn(locationMessage));
    mockSetImmediate.mockImplementation((fn) => fn());

    new AssetConnection(new Logger(), trackingId, ablyOptions, undefined, enhancedLocationListener);

    expect(enhancedLocationListener).toHaveBeenCalledTimes(1);
    expect(enhancedLocationListener).toHaveBeenCalledWith(locationMessage.data);
  });

  it('should execute enhancedLocationListener with location messages when publisher publishes enhanced location message array', () => {
    const enhancedLocationListener = jest.fn();
    const locationMessages = {
      data: [
        {
          stub: 'message',
        },
        {
          other: 'message',
        },
      ],
    };

    mockChannelSubscribe.mockImplementation((_, fn) => fn(locationMessages));
    mockSetImmediate.mockImplementation((fn) => fn());

    new AssetConnection(new Logger(), trackingId, ablyOptions, undefined, enhancedLocationListener);

    expect(enhancedLocationListener).toHaveBeenCalledTimes(2);
    expect(enhancedLocationListener).toHaveBeenNthCalledWith(1, locationMessages.data[0]);
    expect(enhancedLocationListener).toHaveBeenNthCalledWith(2, locationMessages.data[1]);
  });

  it('should update channel presence data when .performChangeResolution is called', () => {
    const resolution = {
      accuracy: 2,
      desiredInterval: 3,
      minimumDisplacement: 4,
    };
    const connection = new AssetConnection(new Logger(), trackingId, ablyOptions);

    connection.performChangeResolution(resolution);

    expect(mockPresenceUpdate).toHaveBeenCalledTimes(1);
    expect(mockPresenceUpdate).toHaveBeenCalledWith({
      type: ClientTypes.Subscriber,
      resolution,
    });
  });

  it('should unsubscribe from channel when .close() is called', () => {
    new AssetConnection(new Logger(), trackingId, ablyOptions).close();

    expect(mockChannelUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should leave channel presence when .close() is called', () => {
    new AssetConnection(new Logger(), trackingId, ablyOptions).close();

    expect(mockPresenceUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockLeaveClient).toHaveBeenCalledTimes(1);
    expect(mockLeaveClient).toHaveBeenCalledWith(clientId);
  });

  it('should call Ably.Realtime.close() when .close() is called', async () => {
    await new AssetConnection(new Logger(), trackingId, ablyOptions).close();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
