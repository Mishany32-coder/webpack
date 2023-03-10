const path                          = require('path');
const HTMLWebpackPlugin             = require('html-webpack-plugin');
const CopyWebpackPlugin             = require('copy-webpack-plugin');
const MiniCssExtractPlugin          = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin           = require('terser-webpack-plugin');
const ESLintWebpackPlugin           = require('eslint-webpack-plugin');
const {BundleAnalyzerPlugin}         = require('webpack-bundle-analyzer');

const isDev  = process.env.NODE_ENV === 'development';
const isProd = !isDev;

console.log('IS DEV: ', isDev);

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config;
}

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const cssLoaders = (extra) => {
    const loaders = [
        {
            loader : MiniCssExtractPlugin.loader,
            options: {},
        },
        'css-loader'
    ];

    if (extra) {
        loaders.push(extra);
    }

    return loaders;
}

const babelOptions = (preset) => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
}

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify  : {
                collapseWhitespace: isProd,
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/favicon.ico'),
                    to  : path.resolve(__dirname, 'dist')
                },
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css'),
        }),
        // new ESLintWebpackPlugin(),

    ];

    if (isProd) {
        base.push(new BundleAnalyzerPlugin);
    }

    return base;
}

module.exports = {
    context     : path.resolve(__dirname, 'src'),
    mode        : 'development',
    entry       : {
        main     : ['@babel/polyfill', './index.jsx'],
        analytics: './analytics.ts',
    },
    output      : {
        filename: filename('js'),
        path    : path.resolve(__dirname, 'dist'),
        clean   : true,
    },
    resolve     : {
        extensions: ['.js', '.json', '.png'],
        alias     : {
            '@'      : path.resolve(__dirname, 'src'),
            '@models': path.resolve(__dirname, 'src/models'),
            '@styles': path.resolve(__dirname, 'src/styles'),
        }
    },
    optimization: optimization(),
    devServer   : {
        static  : {
            directory: path.join(__dirname, 'src'),
        },
        compress: true,
        port    : 8000,
        hot     : isDev,
        open    : true
    },
    devtool     : isDev && 'source-map',
    plugins     : plugins(),
    module      : {
        rules: [
            {
                test: /\.css$/,
                use : cssLoaders()
            },
            {
                test: /\.less$/,
                use : cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use : cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg|gif|jpeg)$/,
                type: "asset/resource"
            },
            {
                test: /\.xml$/,
                use : ['xml-loader']
            },
            {
                test: /\.csv$/,
                use : ['csv-loader']
            },
            {
                test   : /\.m?js$/,
                exclude: /node_modules/,
                use    : {
                    loader : 'babel-loader',
                    options: babelOptions()
                }
            },
            {
                test   : /\.ts$/,
                exclude: /node_modules/,
                use    : {
                    loader : "babel-loader",
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test   : /\.jsx$/,
                exclude: /node_modules/,
                use    : {
                    loader : "babel-loader",
                    options: babelOptions('@babel/preset-react')
                }
            },
        ]
    }
}