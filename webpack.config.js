const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')

const dotenv = new Dotenv()
// Port used to start ONLY the development environment
const port = process.env.PORT || 3005

module.exports = {
    entry: './src/index.js',
    devServer: {
        historyApiFallback: true,
        host: 'localhost',
        open: true,
        port,
    },
    devtool: 'inline-source-map',
    // exclude: {
    //     test: [
    //         /\.html$/,
    //         /\.(js|jsx)$/,
    //         /\.css$/,
    //         /\.json$/,
    //         /\.bmp$/,
    //         /\.gif$/,
    //         /\.jpe?g$/,
    //         /\.png$/,
    //     ],
    //     exclude: [
    //         'src/configs/configs/your.json'
    //     ]
    // },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localsConvention: 'camelCase',
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [{
                    loader: 'url-loader?limit=100000',
                }],
            },
            {
                test: /\.(md)$/,
                use: [{
                    loader: 'ignore-loader',
                }]
            },
        ]
    },
    output: {
        filename: 'bundle.[fullhash].js'
    },
    plugins: [
        dotenv,
        new HtmlWebpackPlugin({
            template: 'public/index.html',
            favicon: 'public/favicon.ico'
        }),
        new webpack.IgnorePlugin({ resourceRegExp: /abort-controller/ }),
        new webpack.IgnorePlugin({ resourceRegExp: /node-fetch/ }),
        new webpack.IgnorePlugin({ resourceRegExp: /node-localstorage/ }),
        new webpack.IgnorePlugin({ resourceRegExp: /nano/ }),
    ],
    resolve: {
        fallback: {
            assert: false,
            buffer: false,
            crypto: false,
            fetch: false, // require.resolve('node-fetch')
            FormData: false, //require.resolve('form-data'),
            fs: false,
            path: false,
            stream: false,
            util: false,
        }
    }
}