const { CheckerPlugin } = require('awesome-typescript-loader');
const { join } = require('path');
const { optimize } = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    'background-page': join(__dirname, 'dev/inject-script/src/background-page.ts'),
    'block-crawler': join(__dirname, 'dev/inject-script/src/block-crawler.ts'),
    'dashboard-controller': join(__dirname, 'dev/inject-script/src/dashboard-controller.ts'),
    'pool-info-crawler': join(__dirname, 'dev/inject-script/src/pool-info-crawler.ts')
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
        use: 'awesome-typescript-loader?{configFileName: "dev/inject-script/tsconfig.json"}'
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
