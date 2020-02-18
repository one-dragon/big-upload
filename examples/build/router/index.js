
const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()
const { EXAMPLES_PATH, ROUTER_PATH, MAIN_TS_NAME } = require('../const')

// 渲染首页，获取所有测试目录(目录中带有app.ts文件)并渲染列表
router.get('/', (req, res) => {
    const dirList = fs.readdirSync(EXAMPLES_PATH).reduce((entries, dir) => {
        const fullDir = path.join(EXAMPLES_PATH, dir)
        const entry = path.join(fullDir, MAIN_TS_NAME)
        if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
            entries.push(dir)
        }
        return entries
    }, [])
    res.render('index', {
        dirList
    })
})

// 加载 router 目录下各个路由文件（除 index.js）
fs.readdirSync(ROUTER_PATH).forEach(file => {
    const fullFile = path.join(ROUTER_PATH, file)
    if (fs.statSync(fullFile).isFile() && file !== 'index.js') {
        require(fullFile)(router)
    }
})

module.exports = router