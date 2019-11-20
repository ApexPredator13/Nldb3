const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        all_remaining_pages: './Ts/Pages/_all-pages.ts',
        all_admin_pages: './Ts/Pages/Admin/_all-admin-pages.ts',
        home: './Ts/Pages/home.ts',
        downloads: './Ts/Pages/downloads.ts',
        episodes: './Ts/Pages/episodes.ts',
        resource_overview: './Ts/Pages/resource-overview.ts',
        episode: './Ts/Pages/episode.ts'
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
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                    path.resolve(__dirname, 'wwwroot')
                ]
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

