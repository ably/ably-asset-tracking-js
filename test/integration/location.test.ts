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
    const asset = subscriber.get(getRandomChannelName());
    asset.start().then(() => {
      asset.stop();
    });
  });

  it('can recieve enhanced location updates', (done) => {
    const location = { mock: 'location2' };
    const channel = getRandomChannelName();

    const onLocationUpdate = (msg: unknown) => {
      expect(msg).to.deep.equal(location);
      asset.stop().then(done);
    };

    const subscriber = new Subscriber({ ablyOptions });
    const asset = subscriber.get(channel);
    asset.addLocationListener(onLocationUpdate);

    asset.start().then(() => {
      publisher.sendEnhancedMessage(channel, location);
    });
  });

  it('recieves the most recent location updates on channel through rewind', (done) => {
    const location = { mock: 'location3' };
    const channel = getRandomChannelName();

    const onLocationUpdate = (msg: unknown) => {
      expect(msg).to.deep.equal(location);
      asset.stop().then(done);
    };

    const subscriber = new Subscriber({ ablyOptions });
    const asset = subscriber.get(channel);
    asset.addLocationListener(onLocationUpdate);

    publisher.sendEnhancedMessage(channel, location).then(() => {
      asset.start();
    });
  });

  it('can receive arrays of enhanced location updates', (done) => {
    const location = { mock: 'location5' };
    const channel = getRandomChannelName();

    const onLocationUpdate = (msg: unknown) => {
      expect(msg).to.deep.equal(location);
      asset.stop().then(done);
    };

    const subscriber = new Subscriber({ ablyOptions });
    const asset = subscriber.get(channel);
    asset.addLocationListener(onLocationUpdate);

    asset.start().then(() => {
      publisher.sendEnhancedMessage(channel, [location]);
    });
  });
});
