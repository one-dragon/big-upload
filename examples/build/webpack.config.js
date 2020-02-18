
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const { EXAMPLES_PATH, OUTPUT_PATH, MAIN_TS_NAME } = require('./const')

module.exports = {
    mode: 'development',

    entry: fs.readdirSync(EXAMPLES_PATH).reduce((entries, dir) => {
        const fullDir = path.join(EXAMPLES_PATH, dir)
        const entry = path.join(fullDir, MAIN_TS_NAME)
        if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
            entries[dir] = ['webpack-hot-middleware/client', entry]
        }
        return entries
    }, {}),

    output: {
        path: path.join(EXAMPLES_PATH, OUTPUT_PATH),
        filename: '[name].js',
        publicPath: `/${OUTPUT_PATH}/`
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                use: [
                    {
                        loader: 'tslint-loader'
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader', 'css-loader'
                ]
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]

}