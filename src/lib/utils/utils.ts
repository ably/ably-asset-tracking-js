// simple implementation of window.setImmediate or NodeJS process.nextTick
// used to execute user-provided callbacks asynchronously
export const setImmediate = (fn: () => unknown): void => {
  setTimeout(fn, 0);
};
