import * as webpack from 'webpack';
import path from 'path';

const hostname = 'localhost';
const port = 3000;

const config: webpack.Configuration = {
  entry: 'mocha-loader!./test/integration/index.ts',
  output: {
    filename: 'test.build.js',
    path: __dirname,
    publicPath: 'http://' + hostname + ':' + port + '/tests',
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    host: hostname,
    port: port,
    contentBase: path.resolve(__dirname, '..'),
    publicPath: '/',
    open: true,
    stats: 'none',
  },
  stats: 'none',
  devtool: 'source-map',
};

export default config;
