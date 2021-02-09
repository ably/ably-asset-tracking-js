import { Types } from 'ably';
import { expect } from 'chai';
import Subscriber from '../../src/lib/Subscriber';
import { MockPublisher, getRandomChannelName } from './support/testUtils';

describe('location', () => {
  let ablyOptions: Types.ClientOptions;
  let publisher: MockPublisher;

  before(async function () {
    this.timeout(5000);
    const key = AblyTestApp.keys[0].keyStr;

    ablyOptions = {
      key,
      environment: 'sandbox',
      clientId: 'integration-test-client',
    };
    publisher = new MockPublisher(key);
  });

  it('can start/stop tracking an asset without error', async () => {
    const subscriber = new Subscriber({ ablyOptions });
    subscriber.start(getRandomChannelName()).then(() => {
      subscriber.stop();
    });
  });

  it('can recieve enhanced location updates', (done) => {
    const location = { mock: 'location2' };
    const channel = getRandomChannelName();

    const onLocationUpdate = (msg: unknown) => {
      expect(msg).to.deep.equal(location);
      subscriber.stop().then(done);
    };

    const subscriber = new Subscriber({ ablyOptions, onLocationUpdate });

    subscriber.start(channel).then(() => {
      publisher.sendEnhancedMessage(channel, location);
    });
  });

  it('recieves the most recent location updates on channel through rewind', (done) => {
    const location = { mock: 'location3' };
    const channel = getRandomChannelName();

    const onLocationUpdate = (msg: unknown) => {
      expect(msg).to.deep.equal(location);
      subscriber.stop().then(done);
    };

    const subscriber = new Subscriber({ ablyOptions, onLocationUpdate });

    publisher.sendEnhancedMessage(channel, location).then(() => {
      subscriber.start(channel);
    });
  });

  it('can receive arrays of enhanced location updates', (done) => {
    const location = { mock: 'location5' };
    const channel = getRandomChannelName();

    const onLocationUpdate = (msg: unknown) => {
      expect(msg).to.deep.equal(location);
      subscriber.stop().then(done);
    };

    const subscriber = new Subscriber({ ablyOptions, onLocationUpdate });

    subscriber.start(channel).then(() => {
      publisher.sendEnhancedMessage(channel, [location]);
    });
  });
});
