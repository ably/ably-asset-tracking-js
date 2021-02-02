import axios from 'axios';

const mochaHooks: { beforeAll: Mocha.AsyncFunc } = {
  beforeAll: async function () {
    this.timeout(10000);
    const response = await axios.post<typeof AblyTestApp>('https://sandbox-rest.ably.io/apps', {
      keys: [
        {},
      ],
    });

    globalThis.AblyTestApp = {
      accountId: response.data.accountId,
      appId: response.data.appId,
      keys: response.data.keys,
    };
  },
};

export default mochaHooks;
