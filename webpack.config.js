let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let loaders = require('./webpack.config.loaders')();
let path = require('path');

loaders.push({
    test: /\.sass$/,
    loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: ['css-loader', 'sass-loader']
    })
});

module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[hash].js',
        path: path.resolve('dist')
    },
    devtool: 'source-map',
    module: {
        loaders
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
        new HtmlPlugin({
            title: 'Yandex maps project',
            template: 'index.hbs'
        }),
        new CleanWebpackPlugin(['dist'])
    ]
};
