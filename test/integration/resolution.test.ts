import { Types } from 'ably';
import { expect } from 'chai';
import Subscriber from '../../src/lib/Subscriber';
import { getRandomChannelName, MockPublisher } from './support/testUtils';

describe('resolution', () => {
  let ablyOptions: Types.ClientOptions;
  let publisher: MockPublisher;

  before(async function () {
    this.timeout(5000);
    const key = AblyTestApp.keys[0].keyStr;

    ablyOptions = {
      key,
      environment: 'sandbox',
      clientId: 'someClient',
    };

    publisher = new MockPublisher(key);
  });

  it('sends requested resolution in presence data on start', (done) => {
    const channel = getRandomChannelName();
    const resolution = {
      accuracy: 1,
      desiredInterval: 100,
      minimumDisplacement: 101,
    };

    publisher.onSubscriberPresenceEnter(channel, (msg) => {
      expect(msg.data.resolution).to.deep.equal(resolution);
      done();
    });

    new Subscriber({ ablyOptions, resolution }).start(channel);
  });

  it('sends new requested resoltion in presence data when sendChangeRequest is called', (done) => {
    const channel = getRandomChannelName();
    const resolution = {
      accuracy: 1,
      desiredInterval: 100,
      minimumDisplacement: 101,
    };

    publisher.onSubscriberPresenceUpdate(channel, (msg) => {
      expect(msg.data.resolution).to.deep.equal(resolution);
      done();
    });

    const subscriber = new Subscriber({ ablyOptions });
    subscriber.start(channel).then(() => {
      subscriber.sendChangeRequest(resolution);
    });
  });

  it('rejects promise when sendChangeRequest is called without an asset', () => {
    const subscriber = new Subscriber({ ablyOptions });

    expect(() => subscriber.sendChangeRequest({ accuracy: 107, desiredInterval: 108, minimumDisplacement: 109 })).to
      .throw;
  });
});
