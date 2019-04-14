const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        validation: './wwwroot/js/src/validation.ts'
    },
    output: {
        path: path.resolve(__dirname, 'wwwroot', 'js', 'dist'),
        filename: '[name].[hash].min.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                    }
                ],
                exclude: '/node-modules/'
            }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.css' ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}