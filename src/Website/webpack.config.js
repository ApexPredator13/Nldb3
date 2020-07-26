const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {

    if (!argv.mode) {
        console.warn('WARNING - webpack mode not detected, defaulting to \'production\'.');
    }

    const mode = argv.mode ? argv.mode : 'development';
    console.log('webpack runs in ' + mode + ' mode.');

    const configFileName = mode === 'development' ? './config.development.js' : './config.production.js';
    console.log('config ' + configFileName + ' is used.');

    return {
        entry: {
            css_combined: './wwwroot/css/src/_combined.js',
            aspnetcore_formvalidation: './Ts/Framework/aspnetcore-formvalidation.js',
            all_remaining_pages: './Ts/Pages/_all-pages.js',
            all_admin_pages: './Ts/Pages/Admin/_all-admin-pages.js',
            home: './Ts/Pages/home.js',
            downloads: './Ts/Pages/downloads.js',
            episodes: './Ts/Pages/episodes.js',
            resource_overview: './Ts/Pages/resource-overview.js',
            episode: './Ts/Pages/episode.js',
            resource: './Ts/Pages/resource.js',
            submit_episode: './Ts/Pages/submit-video.js',
            quotes: './Ts/Pages/quotes.js',
            submit_problem: './Ts/Pages/submit-problem.js',
            random_episode: './Ts/Pages/random-episode-generator.js'
        },
        output: {
            path: path.resolve(__dirname, 'wwwroot', 'js', 'dist'),
            filename: '[name].min.js'
        },
        resolve: {
            alias: {
                [path.resolve(__dirname, 'Ts/Framework/Customizable/config.development.js')] :
                    mode === 'development' 
                    ? path.resolve(__dirname, 'Ts/Framework/Customizable/config.development.js')
                    : path.resolve(__dirname, 'Ts/Framework/Customizable/config.production.js')
            },
            extensions: [ '.js' ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                    filename: '[name].css',
            }),
            new OptimizeCssAssetsPlugin(),
            new CopyPlugin([
                { 
                    from: path.resolve(__dirname, 'node_modules', 'oidc-client', 'dist', 'oidc-client.slim.min.js'),
                    to: path.resolve(__dirname, 'wwwroot', 'js', 'oidc-client.slim.min.js')
                }
            ])
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                    ],
                }
            ]
        },
        devtool: mode === 'development' ? 'inline-source-map' : false,
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
                    }
                }
            }
        },
        performance: {
            hints: false
        }
    };
}
