import Subscriber from '../../src/lib/Subscriber';
import { getRandomChannelName, MockPublisher } from './support/testUtils';

describe('presence', () => {
  let subscriber: Subscriber;
  let publisher: MockPublisher;

  before(async function () {
    this.timeout(5000);
  });

  beforeEach(async function () {
    const key = AblyTestApp.keys[0].keyStr;
    publisher = new MockPublisher(key);
    subscriber = new Subscriber({
      ablyOptions: {
        key,
        environment: 'sandbox',
        clientId: 'someClient',
      },
    });
  });

  it('enters channel presence on start', (done) => {
    const channel = getRandomChannelName();
    const asset = subscriber.get(channel);

    publisher.onSubscriberPresenceEnter(channel, async () => {
      await asset.stop();
      done();
    });

    asset.start();
  });

  it('leaves channel presence on stop', (done) => {
    const channel = getRandomChannelName();
    const asset = subscriber.get(channel);

    publisher.onSubscriberPresenceLeave(channel, done);

    asset.start().then(() => {
      asset.stop();
    });
  });

  it('calls onStatusUpdate when publisher is already present', (done) => {
    const channel = getRandomChannelName();
    const asset = subscriber.get(channel);

    asset.addStatusListener((status) => {
      if (status) done();
    });

    publisher.enterPresence(channel).then(() => {
      asset.start();
    });
  });

  it('calls onStatusUpdate when publisher enters presence', (done) => {
    const channel = getRandomChannelName();
    const asset = subscriber.get(channel);

    asset.addStatusListener((status) => {
      if (status) done();
    });

    asset.start().then(() => {
      publisher.enterPresence(channel);
    });
  });

  it('calls onStatusUpdate when publisher leaves presence', (done) => {
    const channel = getRandomChannelName();
    publisher.enterPresence(channel);
    const asset = subscriber.get(channel);
    asset.addStatusListener((status) => {
      if (!status) done();
    });
    asset.start().then(() => {
      publisher.leavePresence(channel);
    });
  });
});
