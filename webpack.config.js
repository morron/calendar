var Webpack = require('webpack');
var path = require('path');
var appPath = path.resolve(__dirname, 'public', 'javascripts');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'assets');

var config = {
    context: __dirname,
    devtool: 'eval-source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/dev-server',
        path.resolve(appPath, 'main.js')],
    output: {
        path: buildPath,
        filename: 'bundle.js',
        publicPath: '/assets/'
    },
    module: {
        loaders: [
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.coffee$/, loader: "coffee-loader" },
            { test: /\.(coffee\.md|litcoffee)$/, loader: "coffee-loader?literate" }
        ]
    },
    plugins: [new Webpack.HotModuleReplacementPlugin()]
};

module.exports = config;