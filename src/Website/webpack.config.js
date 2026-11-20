const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {

    if (!argv.mode) {
        console.warn('WARNING - webpack mode not detected, defaulting to \'development\'.');
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
            filename: '[name].min.js',
            publicPath: '/js/dist/',
            clean: true
        },
        resolve: {
            alias: {
                [path.resolve(__dirname, 'Ts/Framework/Customizable/config.development.js')]:
                    mode === 'development'
                        ? path.resolve(__dirname, 'Ts/Framework/Customizable/config.development.js')
                        : path.resolve(__dirname, 'Ts/Framework/Customizable/config.production.js')
            },
            extensions: ['.js']
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
            })
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
                        }
                    ],
                }
            ]
        },
        devtool: mode === 'development' ? 'inline-source-map' : false,
        externals: {
            moment: 'moment'
        },
        optimization: {
            minimizer: [
                '...',
                new CssMinimizerPlugin()
            ],
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
};
