const { CheckerPlugin } = require('awesome-typescript-loader');
const { join } = require('path');
const { optimize } = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    'background-page': join(__dirname, 'app/chrome/src/background-page.ts'),
    'block-crawler': join(__dirname, 'app/chrome/src/block-crawler.ts'),
    'dashboard-controller': join(__dirname, 'app/chrome/src/dashboard-controller.ts'),
    'pool-info-crawler': join(__dirname, 'app/chrome/src/pool-info-crawler.ts')
  },
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'awesome-typescript-loader?{configFileName: "app/chrome/tsconfig.json"}'
      }
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new optimize.AggressiveMergingPlugin(),
    new optimize.OccurrenceOrderPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js']
  }
};
