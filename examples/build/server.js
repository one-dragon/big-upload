
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')

const app = express()
const router = require('./router')
const ejs = require('ejs')
const compiler = webpack(WebpackConfig)
const { EXAMPLES_PATH, OUTPUT_PATH } = require('./const')

app.use(webpackDevMiddleware(compiler, {
    publicPath: `/${OUTPUT_PATH}/`,
    stats: {
        colors: true,
        chunks: false
    }
}))

app.use(webpackHotMiddleware(compiler))

app.use(express.static(EXAMPLES_PATH))
// 把./views目录设置为模板文件的根，ejs、html文件模板放在view目录中
app.set('views', __dirname + '/views')
// 设置模板引擎为ejs
app.set('view engine', 'ejs')
// 为html扩展名注册ejs
app.engine('html', ejs.renderFile)


app.use(router)

const port = process.env.PORT || 8080
module.exports = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})