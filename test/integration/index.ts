import CustomEventReporter from './support/CustomEventReporter';
import mochaHooks from './support/mochaHooks';

mocha.rootHooks(mochaHooks);
mocha.timeout(10_000);

// This will search for files ending in .test.js and require them
// so that they are added to the webpack bundle
const ctx = require.context('.', true, /.+\.test\.ts?$/);
ctx.keys().forEach(ctx);
module.exports = ctx;
