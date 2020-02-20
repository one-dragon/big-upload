
const { UPLOAD_FILE_PATH, UPLOAD_FILE_TEMP_PATH } = require('../const')
const path = require('path')
const fse = require('fs-extra')
const multer = require('multer')
const getFileName = function (body) {
    const { currentHash, index } = body
    return `${currentHash}-${index}`
}
const getDirPath = function (body) {
    const { hash } = body
    return path.join(UPLOAD_FILE_TEMP_PATH, hash)
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // 设置存储位置
        let dirPath = getDirPath(req.body)
        fse.ensureDirSync(dirPath)
        cb(null, dirPath)
    },
    filename: function (req, file, cb) { // 设置保存文件名字
        cb(null, getFileName(req.body))
    }
})
const upload = multer({ 
    // dest: UPLOAD_FILE_TEMP_PATH,
    storage: storage,
    fileFilter(req, file, cb) { // 判断文件是否存在，并是否接收文件
        console.log(new Date().getTime())
        console.log('fileFilter===============')
        console.log(req.body)
        let filePath = path.join(getDirPath(req.body), getFileName(req.body))
        if (fse.pathExistsSync(filePath)) {
            cb(null, false)
            cb(new Error('文件已上传'))
        }else {
            cb(null, true)
        }
        // 如果有问题，你可以总是这样发送一个错误:
        // cb(new Error('I don\'t have a clue!'))
    }
}).single('file')

module.exports = function (router) {
    // 文件上传
    router.post('/upload', (req, res, next) => {
        upload(req, res,(err)=> {
            if(err) {
                // 进行错误捕获
                res.json({ code: -1, msg: err.toString() })
            }else{
                next()
            }
        })
    }, function (req, res) {
            // console.log('uploadUrl========')
            // console.log(req.body)
            res.json(req.body)
        })
    }