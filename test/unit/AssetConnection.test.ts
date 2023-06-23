import AssetConnection, { EventNames } from '../../src/lib/AssetConnection';
import { ClientTypes, Accuracy } from '../../src/lib/constants';
import { setImmediate } from '../../src/lib/utils/utils';
import { mocked } from 'ts-jest/utils';
import Subscriber from '../../src/lib/Subscriber';

const mockPresenceSubscribe = jest.fn();
const mockPresenceUnsubscribe = jest.fn();
const mockLeaveClient = jest.fn();
const mockEnterClient = jest.fn();
const mockChannelsGet = jest.fn();
const mockChannelSubscribe = jest.fn();
const mockPresenceUpdate = jest.fn();
const mockChannelUnsubscribe = jest.fn();
const mockSetImmediate = mocked(setImmediate);

const trackingId = 'trackingId';
const clientId = 'clientId';

jest.mock('../../src/lib/utils/utils');

const subscriber = {
  client: {
    channels: {
      get: mockChannelsGet,
      release: jest.fn(),
    },
    auth: {
      clientId,
    },
  },
} as unknown as Subscriber;

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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call ably.realtime.channels.get() with rewind=1 when constructor is called', () => {
    new AssetConnection(subscriber, trackingId);

    expect(mockChannelsGet).toHaveBeenCalledTimes(1);
    expect(mockChannelsGet).toHaveBeenCalledWith(`tracking:${trackingId}`, {
      params: {
        rewind: '1',
      },
    });
  });

  it('should subscribe to presence events when .joinChannelPresence() is called', async () => {
    await new AssetConnection(subscriber, trackingId).joinChannelPresence();

    expect(mockPresenceSubscribe).toHaveBeenCalledTimes(1);
  });

  it('should enter channel presence with correct params when .joinChannelPresence() is called', () => {
    const resolution = {
      accuracy: Accuracy.Low,
      desiredInterval: 3,
      minimumDisplacement: 4,
    };
    new AssetConnection(subscriber, trackingId, resolution).joinChannelPresence();

    expect(mockEnterClient).toHaveBeenCalledTimes(1);
    expect(mockEnterClient).toHaveBeenCalledWith(clientId, { type: ClientTypes.Subscriber, resolution });
  });

  it('should subscribe to raw and enhanced events when start is called', async () => {
    await new AssetConnection(subscriber, trackingId).start();

    expect(mockChannelSubscribe).toHaveBeenCalledTimes(2);
    expect(mockChannelSubscribe).toHaveBeenCalledWith(EventNames.Enhanced, expect.any(Function));
    expect(mockChannelSubscribe).toHaveBeenCalledWith(EventNames.Raw, expect.any(Function));
  });

  it('should call onStatusUpdate with true when publisher enters channel presence', async () => {
    const onStatusUpdate = jest.fn();

    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
      },
      action: 'enter',
    };

    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.statusListeners.add(onStatusUpdate);

    await assetConnection.joinChannelPresence();

    expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusUpdate).toHaveBeenCalledWith(true);
  });

  it('should call onStatusUpdate with true when publisher is already present', async () => {
    const onStatusUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
      },
      action: 'present',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.statusListeners.add(onStatusUpdate);

    await assetConnection.joinChannelPresence();

    expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusUpdate).toHaveBeenCalledWith(true);
  });

  it('should call onStatusUpdate with false when publisher is absent', async () => {
    const onStatusUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
      },
      action: 'absent',
    };

    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.statusListeners.add(onStatusUpdate);

    await assetConnection.joinChannelPresence();

    expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusUpdate).toHaveBeenCalledWith(false);
  });

  it('should call onStatusUpdate with false when publisher leaves channel presence', async () => {
    const onStatusUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
      },
      action: 'leave',
    };

    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.statusListeners.add(onStatusUpdate);

    await assetConnection.joinChannelPresence();

    expect(onStatusUpdate).toHaveBeenCalledTimes(1);
    expect(onStatusUpdate).toHaveBeenCalledWith(false);
  });

  it('should call publisher resolution listeners when publisher enters channel presence and has a resolution', async () => {
    const onResolutionUpdate = jest.fn();
    const onLocationUpdateIntervalUpdate = jest.fn();
    const publisherResolution = { accuracy: 'BALANCED', desiredInterval: 1, minimumDisplacement: 1.0 };
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
        resolution: publisherResolution,
      },
      action: 'enter',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.resolutionListeners.add(onResolutionUpdate);
    assetConnection.locationUpdateIntervalListeners.add(onLocationUpdateIntervalUpdate);

    await assetConnection.joinChannelPresence();

    expect(onResolutionUpdate).toHaveBeenCalledTimes(1);
    expect(onResolutionUpdate).toHaveBeenCalledWith(publisherResolution);
    expect(onLocationUpdateIntervalUpdate).toHaveBeenCalledTimes(1);
    expect(onLocationUpdateIntervalUpdate).toHaveBeenCalledWith(publisherResolution.desiredInterval);
  });

  it('should not call publisher resolution listeners when publisher enters channel presence and does not have a resolution', async () => {
    const onResolutionUpdate = jest.fn();
    const onLocationUpdateIntervalUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
        resolution: null,
      },
      action: 'enter',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.resolutionListeners.add(onResolutionUpdate);
    assetConnection.locationUpdateIntervalListeners.add(onLocationUpdateIntervalUpdate);

    await assetConnection.joinChannelPresence();

    expect(onResolutionUpdate).toHaveBeenCalledTimes(0);
    expect(onLocationUpdateIntervalUpdate).toHaveBeenCalledTimes(0);
  });

  it('should call publisher resolution listeners when publisher updates channel presence and has a resolution', async () => {
    const onResolutionUpdate = jest.fn();
    const onLocationUpdateIntervalUpdate = jest.fn();
    const publisherResolution = { accuracy: 'BALANCED', desiredInterval: 1, minimumDisplacement: 1.0 };
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
        resolution: publisherResolution,
      },
      action: 'update',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.resolutionListeners.add(onResolutionUpdate);
    assetConnection.locationUpdateIntervalListeners.add(onLocationUpdateIntervalUpdate);

    await assetConnection.joinChannelPresence();

    expect(onResolutionUpdate).toHaveBeenCalledTimes(1);
    expect(onResolutionUpdate).toHaveBeenCalledWith(publisherResolution);
    expect(onLocationUpdateIntervalUpdate).toHaveBeenCalledTimes(1);
    expect(onLocationUpdateIntervalUpdate).toHaveBeenCalledWith(publisherResolution.desiredInterval);
  });

  it('should not call publisher resolution listeners when publisher updates channel presence and does not have a resolution', async () => {
    const onResolutionUpdate = jest.fn();
    const onLocationUpdateIntervalUpdate = jest.fn();
    const presenceMessage = {
      data: {
        type: ClientTypes.Publisher,
        resolution: null,
      },
      action: 'update',
    };
    mockPresenceSubscribe.mockImplementation((fn) => fn(presenceMessage));

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.resolutionListeners.add(onResolutionUpdate);
    assetConnection.locationUpdateIntervalListeners.add(onLocationUpdateIntervalUpdate);

    await assetConnection.joinChannelPresence();

    expect(onResolutionUpdate).toHaveBeenCalledTimes(0);
    expect(onLocationUpdateIntervalUpdate).toHaveBeenCalledTimes(0);
  });

  it('should execute enhancedLocationListener with location message when publisher publishes enhanced location message', async () => {
    const enhancedLocationListener = jest.fn();
    const locationMessage = {
      data: {
        stub: 'message',
      },
    };

    mockChannelSubscribe.mockImplementation((_, fn) => fn(locationMessage));
    mockSetImmediate.mockImplementation((fn) => fn());

    const assetConnection = new AssetConnection(subscriber, trackingId);
    assetConnection.enhancedLocationListeners.add(enhancedLocationListener);
    await assetConnection.start();

    expect(enhancedLocationListener).toHaveBeenCalledTimes(1);
    expect(enhancedLocationListener).toHaveBeenCalledWith(locationMessage.data);
  });

  it('should execute rawLocationListener with location message when publisher publishes raw location message', async () => {
    const rawLocationListener = jest.fn();
    const locationMessage = {
      data: {
        stub: 'message',
      },
    };

    mockChannelSubscribe.mockImplementation((_, fn) => fn(locationMessage));
    mockSetImmediate.mockImplementation((fn) => fn());

    const assetConnection = new AssetConnection(subscriber, trackingId);
    assetConnection.rawLocationListeners.add(rawLocationListener);
    await assetConnection.start();

    expect(rawLocationListener).toHaveBeenCalledTimes(1);
    expect(rawLocationListener).toHaveBeenCalledWith(locationMessage.data);
  });

  it('should execute enhancedLocationListener with location messages when publisher publishes enhanced location message array', async () => {
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

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.enhancedLocationListeners.add(enhancedLocationListener);

    await assetConnection.start();

    expect(enhancedLocationListener).toHaveBeenCalledTimes(2);
    expect(enhancedLocationListener).toHaveBeenNthCalledWith(1, locationMessages.data[0]);
    expect(enhancedLocationListener).toHaveBeenNthCalledWith(2, locationMessages.data[1]);
  });

  it('should execute rawLocationListener with location messages when publisher publishes raw location message array', async () => {
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

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.rawLocationListeners.add(rawLocationListener);

    await assetConnection.start();

    expect(rawLocationListener).toHaveBeenCalledTimes(2);
    expect(rawLocationListener).toHaveBeenNthCalledWith(1, locationMessages.data[0]);
    expect(rawLocationListener).toHaveBeenNthCalledWith(2, locationMessages.data[1]);
  });

  it('should update channel presence data when .performChangeResolution is called', () => {
    const resolution = {
      accuracy: Accuracy.Low,
      desiredInterval: 3,
      minimumDisplacement: 4,
    };

    const assetConnection = new AssetConnection(subscriber, trackingId);

    assetConnection.performChangeResolution(resolution);

    expect(mockPresenceUpdate).toHaveBeenCalledTimes(1);
    expect(mockPresenceUpdate).toHaveBeenCalledWith({
      type: ClientTypes.Subscriber,
      resolution,
    });
  });

  it('should unsubscribe from channel when .close() is called', () => {
    new AssetConnection(subscriber, trackingId).close();

    expect(mockChannelUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should leave channel presence when .close() is called', () => {
    new AssetConnection(subscriber, trackingId).close();

    expect(mockPresenceUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockLeaveClient).toHaveBeenCalledTimes(1);
    expect(mockLeaveClient).toHaveBeenCalledWith(clientId);
  });
});
