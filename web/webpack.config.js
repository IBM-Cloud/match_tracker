var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  entry: './client/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/public/js',
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/bootstrap/dist', to: '../css/bootstrap' }
  ])],
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};

module.exports = config;
