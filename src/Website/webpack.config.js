const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        validation: './wwwroot/js/src/validation.ts',
        simple_confirmation_button: './wwwroot/js/src/simple-confirmation-button.ts',
        resource_selector: './wwwroot/js/src/resource-selector.ts',
        isaac_resource_video_loader: './wwwroot/js/src/isaac-resource-video-loader.ts',
        submit_episode: './wwwroot/js/src/submit-episode.ts',
        set_admin_mode: './wwwroot/js/src/set-admin-mode.ts',
        drag_and_drop: './wwwroot/js/src/drag-and-drop.ts',
        charts: './wwwroot/js/src/charts.ts',
        resource_overview: './wwwroot/js/src/resource-overview.ts',
        video_quotes: './wwwroot/js/src/video-quotes.ts',
        quotes: './wwwroot/js/src/quotes.ts',
        frontpage: './wwwroot/js/src/frontpage.ts'
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
        extensions: [ '.ts', '.css', '.js' ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ],
    mode: 'production',
    externals: {
        moment: 'moment'
    }
}