/* eslint-disable @typescript-eslint/no-empty-function */
import AssetConnection from '../../src/lib/AssetConnection';
import AssetSubscriber from '../../src/lib/Subscriber';
import Logger from '../../src/lib/utils/Logger';
import { mocked } from 'ts-jest/utils';

// This is the simplest constructor options object that Typescript will allow to compile
const basicOptions = {
  ablyOptions: {},
};

const mockClose = jest.fn();
const mockPerformChangeResolution = jest.fn();
const mockJoinChannelPresence = jest.fn();
jest.mock('../../src/lib/AssetConnection');
jest.mock('../../src/lib/utils/Logger');
const mockAssetConnection = mocked(AssetConnection, true);

describe('AssetSubscriber', () => {
  beforeEach(() => {
    mockAssetConnection.mockReturnValue(({
      close: mockClose,
      performChangeResolution: mockPerformChangeResolution,
      joinChannelPresence: mockJoinChannelPresence,
    } as unknown) as AssetConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should construct a new Logger on creation', () => {
    new AssetSubscriber(basicOptions);

    expect(Logger).toHaveBeenCalledTimes(1);
    expect(Logger).toHaveBeenCalledWith(undefined);
  });

  it('should pass the specified log level to the logger constructor', () => {
    const loggerOptions = {
      level: 5,
    };

    new AssetSubscriber({ ...basicOptions, loggerOptions });

    expect(Logger).toHaveBeenCalledTimes(1);
    expect(Logger).toHaveBeenCalledWith(loggerOptions);
  });

  it('should call the AssetConnection constructor with correct args when .start() is called', () => {
    const ablyOptions = {};
    const onStatusUpdate = () => {};
    const onLocationUpdate = () => {};
    const loggerOptions = {
      level: 5,
    };
    const resolution = {
      accuracy: 2,
      desiredInterval: 3,
      minimumDisplacement: 4,
    };
    const trackingId = 'trackingId';
    const subscriber = new AssetSubscriber({
      ablyOptions,
      onStatusUpdate,
      onLocationUpdate,
      loggerOptions,
      resolution,
    });

    subscriber.start(trackingId);

    expect(AssetConnection).toHaveBeenCalledTimes(1);
    expect(AssetConnection).toHaveBeenCalledWith(
      subscriber.logger,
      trackingId,
      ablyOptions,
      onLocationUpdate,
      onStatusUpdate,
      resolution
    );
  });

  it('should call AssetConnection.joinChannelPresence() when start is called', async () => {
    const subscriber = new AssetSubscriber(basicOptions);

    await subscriber.start('trackingId');
    expect(mockJoinChannelPresence).toHaveBeenCalledTimes(1);
  });

  it('should call AssetConnection.close() when .stop() is called', async () => {
    const subscriber = new AssetSubscriber(basicOptions);

    await subscriber.start('trackingId');
    await subscriber.stop();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('should no longer have an AssetConnection once .stop() has been called', async () => {
    const subscriber = new AssetSubscriber(basicOptions);

    await subscriber.start('trackingId');

    expect(subscriber.assetConnection).toBeInstanceOf(Object);

    await subscriber.stop();

    expect(subscriber.assetConnection).toBe(undefined);
  });

  it('should call AssetConnection.performChangeResolution() when .sendChangeRequest() is called', async () => {
    const subscriber = new AssetSubscriber(basicOptions);
    const resolution = {
      accuracy: 5,
      desiredInterval: 4,
      minimumDisplacement: 3,
    };

    await subscriber.start('trackingId');
    await subscriber.sendChangeRequest(resolution);

    expect(mockPerformChangeResolution).toHaveBeenCalledTimes(1);
    expect(mockPerformChangeResolution).toHaveBeenCalledWith(resolution);
  });

  it('should reject promise when .sendChangeRequest() is called without asset being tracked', async () => {
    const subscriber = new AssetSubscriber(basicOptions);
    const resolution = {
      accuracy: 5,
      desiredInterval: 4,
      minimumDisplacement: 3,
    };

    try {
      await subscriber.sendChangeRequest(resolution);
      fail('sendChangeRequest did not reject promise');
    } catch (e) {
      expect(e.message).toBe('Cannot change resolution; no asset is currently being tracked.');
    }
  });
});
