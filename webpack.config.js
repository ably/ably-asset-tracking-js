module.exports = {
  target: 'web',
  output: {
    library: 'AblyAssetTracking',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader'},
    ],
  },
  externals: {
    ably: true,
  },
};