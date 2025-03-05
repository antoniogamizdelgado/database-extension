//@ts-check

'use strict';

const path = require('path');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const webviewConfig = {
  target: 'web',
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/webview/tableView.ts',
  output: {
    path: path.resolve(__dirname, 'dist', 'webview'),
    filename: 'tableView.js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /^(?!.*\/webview\/).*/],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'webview.tsconfig.json')
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

module.exports = webviewConfig; 