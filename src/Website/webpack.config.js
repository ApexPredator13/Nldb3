const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

const configuration = 'development';

module.exports = {
    entry: {
        aspnetcore_formvalidation: './Ts/Framework/aspnetcore-formvalidation.js',
        all_remaining_pages: './Ts/Pages/_all-pages.js',
        all_admin_pages: './Ts/Pages/Admin/_all-admin-pages.js',
        home: './Ts/Pages/home.js',
        downloads: './Ts/Pages/downloads.js',
        episodes: './Ts/Pages/episodes.js',
        resource_overview: './Ts/Pages/resource-overview.js',
        episode: './Ts/Pages/episode.js',
        resource: './Ts/Pages/resource.js',
        submit_episode: './Ts/Pages/submit-video.js'
    },
    output: {
        path: path.resolve(__dirname, 'wwwroot', 'js', 'dist'),
        filename: '[name].min.js'
    },
    resolve: {
        extensions: [ '.js' ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.NormalModuleReplacementPlugin(
            /Framework[\//]Customizable[\//]config.development.js/,
            configuration === 'production' ? './config.production.js' : './config.development.js'
        )
    ],
    //devtool: 'inline-source-map',
    mode: 'development',
    externals: {
        moment: 'moment'
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            minSize: 0,
            minChunks: 2,
            chunks: 'all',
            cacheGroups: {
                default: false,
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    reuseExistingChunk: false
                },
                framework: {
                    test: /([\\/]Framework[\\/])/,
                    name: 'framework',
                    reuseExistingChunk: false
                },
            }
        }
    },
    performance: {
        hints: false
    },
    watch: true
}

