var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/index.jsx',
    output: {
        path: path.resolve(__dirname, '../server/public'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env', "@babel/preset-react"]
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};