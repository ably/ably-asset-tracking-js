export const nextTick = (fn: () => unknown): void => {
  setTimeout(fn, 0);
};
