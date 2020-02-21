
import upload from '../../src/upload'

declare var Vue: any
let app = new Vue({
    el: '#app',
    data() {
        return {
            uploadFile: null,
            fileList: []
        }
    },
    methods: {
        abortUpload(hash) {
            if (this.uploadFile) {
                // alert(hash)
                this.uploadFile.abort(hash)
            }
        },
        removeUpload(hash) {
            if (this.uploadFile) {
                this.uploadFile.remove(hash)
            }
        },
        submitUpload() {
            if (this.uploadFile) {
                this.uploadFile.submit()
            }
        },
        selectFile() {
            this.$refs.fileInput.click()
        },
        onProgress(percentage) {
            this.percentage = percentage
        }
    },
    mounted() {
        this.$nextTick(() => {
            let self = this
            this.uploadFile = upload({
                el: '#selectFile',
                action: '/upload',
                multiple: true,
                autoUpload: false,
                isLocalRecord: true,
                chunkSize: 2 * 1024 * 1024,
                onChange(fileDataList) {
                    console.log('=============onChange=============')
                    console.log(fileDataList)
                    self.fileList = fileDataList.map(item => {
                        item.percentage = 0
                        return item
                    })
                },
                onBeforeUpload() {
                    // alert(1)
                    // return true
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(1)
                        }, 1000)
                    })
                },
                onProgress(data) {
                    // self.onProgress(data.percent)
                    self.fileList.forEach((item, index) => {
                        if(item.hash === data.hash) {
                            self.fileList[index].percentage = data.percent
                        }
                        return
                    })
                    console.log('=============onProgress=============')
                    console.log(data.percent + '%')
                },
                onSuccess(res, fileData, file) {
                    console.log('=============onSuccess=============')
                    console.log('res=====')
                    console.log(res)
                    console.log('fileData========')
                    console.log(fileData)
                    console.log('file===========')
                    console.log(file)
                },
                onComplete(resList, dataList, fileList) {
                    console.log('=============onComplete=============')
                    console.log('resList=====')
                    console.log(resList)
                    console.log('dataList========')
                    console.log(dataList)
                    console.log('fileList===========')
                    console.log(fileList)
                },
                onError(err, sliceFile, file) {
                    console.log('=============onError=============')
                    console.log('err=====')
                    console.log(err)
                    console.log('sliceFile=====')
                    console.log(sliceFile)
                    console.log('file=====')
                    console.log(file)
                },
                // onBeforeSliceFileUpload(data) {
                //     console.log('=============onBeforeSliceFileUpload=============')
                //     console.log(data)
                //     return new Promise(resolve => {
                //         resolve(true)
                //     })
                // }
            })
            // this.uploadFile.disabled()
            // this.uploadFile.disabled(false)
        })
        // let btn: HTMLLIElement = document.querySelector('#btn')
        // btn.onclick = function () {
        //     up.submit()
        // }
    }
})
