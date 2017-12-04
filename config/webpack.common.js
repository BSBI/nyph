require('dotenv').config({ silent: true }); // get local environment variables from .env

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pkg = require('../package.json');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const extractSass = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: process.env.NODE_ENV === 'development',
});

const srcPath = path.resolve(__dirname, '../src');

const sassLoaders = [
  'css-loader?-url',
  'postcss-loader',
  `sass-loader?includePaths[]=${path.resolve(srcPath)}`,
];

module.exports = {
  context: srcPath,
  entry: {
    app: './main.js',
    vendor: './vendor.js',
  },
  output: {
    path: __dirname + '../dist/main',
    filename: '[name].js', // Notice we use a variable
  },
  resolve: {
     modules: [
      path.resolve('./dist/_build'),
      //path.resolve('./node_modules/'),
      path.resolve('./src/'),
      path.resolve('./src/common/vendor'),
      "node_modules"
    ],
    alias: {
      app: 'app',
      config: 'common/config',
      helpers: 'common/helpers/main',

      // vendor
      typeahead: 'typeahead.js/dist/typeahead.jquery',
      bootstrap: 'bootstrap/js/bootstrap',
      ratchet: 'ratchet/dist/js/ratchet',
      'photoswipe-lib': 'photoswipe/dist/photoswipe',
      'photoswipe-ui-default': 'photoswipe/dist/photoswipe-ui-default',
    },
  },
  module: {
    loaders: [
      {
        test: /^((?!data\.).)*\.js$/,
        exclude: /(node_modules|bower_components|vendor(?!\.js))/,
        loader: 'babel-loader',
      },
      { test: /\.json/, loader: 'json' },
      { test: /(\.png)|(\.svg)|(\.jpg)/, loader: 'file?name=images/[name].[ext]' },
      { test: /(\.woff)|(\.ttf)/, loader: 'file?name=font/[name].[ext]' },
      {
        test: /\.s?css$/,
        //loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!')),
        use: extractSass.extract({
          use: [
            {
              loader: 'css-loader?-url',
            },
            {
              loader: `sass-loader?includePaths[]=${srcPath}`,
            },
          ],
          // use style-loader in development
          fallback: 'style-loader',
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor'],
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.TRAINING': process.env.TRAINING || false,
      APP_BUILD: JSON.stringify(process.env.TRAVIS_BUILD_ID || pkg.build || new Date().getTime()),
      APP_NAME: JSON.stringify(pkg.name),
      APP_VERSION: JSON.stringify(pkg.version),
      API_SECRET: JSON.stringify(process.env.API_SECRET || ''),
      API_KEY: JSON.stringify(process.env.API_KEY || ''),
      ADMIN_USERNAME: JSON.stringify(process.env.ADMIN_USERNAME || ''),
      ADMIN_PASSWORD: JSON.stringify(process.env.ADMIN_PASSWORD || ''),
    }),
    new CircularDependencyPlugin(),
  ],
  //postcss: [
  //  autoprefixer({
  //    browsers: ['last 2 versions'],
  //  }),
  //],
  stats: {
    children: false,
  },
  cache: true,
};
