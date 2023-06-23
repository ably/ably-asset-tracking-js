import AssetConnection from '../../src/lib/AssetConnection';
import { mocked } from 'ts-jest/utils';
import Asset from '../../src/lib/Asset';
import Subscriber from '../../src/lib/Subscriber';
import { Resolution } from '../../src/types';

jest.mock('../../src/lib/AssetConnection');

const mockClose = jest.fn();
const mockStart = jest.fn();
const mockPerformChangeResolution = jest.fn();
const mockJoinChannelPresence = jest.fn();
const mockAssetConnection = mocked(AssetConnection, true);

const subscriber = {} as unknown as Subscriber;

const trackingId = 'trackingId';
const resolution = {} as Resolution;

describe('Asset', () => {
  beforeEach(() => {
    mockAssetConnection.mockReturnValue({
      start: mockStart,
      close: mockClose,
      performChangeResolution: mockPerformChangeResolution,
      joinChannelPresence: mockJoinChannelPresence,
    } as unknown as AssetConnection);
  });

  it('Should call the AssetConnection constructor with correct args on init', () => {
    new Asset(subscriber, trackingId, resolution);

    expect(mockAssetConnection).toHaveBeenCalledWith(subscriber, trackingId, resolution);
  });

  it('Should call AssetConnection.start on when start called', async () => {
    const asset = new Asset(subscriber, trackingId, resolution);

    await asset.start();

    expect(mockStart).toHaveBeenCalledTimes(1);
  });

  it('Should call AssetConnection.close on when stop called', async () => {
    const asset = new Asset(subscriber, trackingId, resolution);

    await asset.start();
    await asset.stop();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('Should call AssetConnection.performChangeResolution on when sendChangeRequest called', async () => {
    const asset = new Asset(subscriber, trackingId, resolution);

    const newResolution = {} as Resolution;

    await asset.start();
    await asset.sendChangeRequest(newResolution);

    expect(mockPerformChangeResolution).toHaveBeenCalledTimes(1);
    expect(mockPerformChangeResolution).toHaveBeenCalledWith(newResolution);
  });
});
