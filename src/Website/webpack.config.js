const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        validation: './wwwroot/js/src/validation.ts',
        simple_confirmation_button: './wwwroot/js/src/simple-confirmation-button.ts',
        resource_selector: './wwwroot/js/src/resource-selector.ts'
    },
    output: {
        path: path.resolve(__dirname, 'wwwroot', 'js', 'dist'),
        filename: '[name].min.js'
    },
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