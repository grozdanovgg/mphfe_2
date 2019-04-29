const { CheckerPlugin } = require('awesome-typescript-loader');
const { join } = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    'background-page': join(__dirname, 'src/chrome/src/background-page.ts'),
    'block-crawler': join(__dirname, 'src/chrome/src/block-crawler.ts'),
    'dashboard-controller': join(__dirname, 'src/chrome/src/dashboard-controller.ts'),
    'pool-info-crawler': join(__dirname, 'src/chrome/src/pool-info-crawler.ts')
  },
  output: {
    path: join(__dirname, 'dist/mphfe'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'awesome-typescript-loader?{configFileName: "src/chrome/tsconfig.json"}'
      }
    ]
  },
  plugins: [new CheckerPlugin()],
  resolve: {
    extensions: ['.ts', '.js']
  }
};
