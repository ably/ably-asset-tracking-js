import Subscriber from '../../src/lib/Subscriber';
import Logger from '../../src/lib/utils/Logger';
import { Types } from 'ably';
import Asset from '../../src/lib/Asset';
import { mocked } from 'ts-jest/utils';

// This is the simplest constructor options object that Typescript will allow to compile
const basicOptions = {
  ablyOptions: {},
};

jest.mock('../../src/lib/Asset');
jest.mock('../../src/lib/utils/Logger');

const mockAblyConstructor = jest.fn();
const mockAssetConstructor = mocked(Asset, true);
const mockClose = jest.fn();

jest.mock('ably', () => ({
  Realtime: {
    Promise: (options: Types.ClientOptions) => mockAblyConstructor(options),
  },
}));

describe('Subscriber', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should construct a new Logger on creation', () => {
    new Subscriber(basicOptions);

    expect(Logger).toHaveBeenCalledTimes(1);
    expect(Logger).toHaveBeenCalledWith(undefined);
  });

  it('should pass the specified log level to the logger constructor', () => {
    const loggerOptions = {
      level: 5,
    };

    new Subscriber({ ...basicOptions, loggerOptions });

    expect(Logger).toHaveBeenCalledTimes(1);
    expect(Logger).toHaveBeenCalledWith(loggerOptions);
  });

  it('should create a new Ably.Realtime.Promise instance on init', () => {
    const ablyOptions = {};
    new Subscriber({ ablyOptions });

    expect(mockAblyConstructor).toHaveBeenCalledTimes(1);
    expect(mockAblyConstructor).toHaveBeenCalledWith(ablyOptions);
  });

  it('should return the same asset when get called multiple times', () => {
    const subscriber = new Subscriber(basicOptions);
    subscriber.get('trackingId');
    subscriber.get('trackingId');
    expect(mockAssetConstructor).toHaveBeenCalledTimes(1);
  });

  it('should close ably client when close called', () => {
    mockAblyConstructor.mockReturnValue({
      close: mockClose,
    });

    const subscriber = new Subscriber(basicOptions);

    subscriber.close();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
