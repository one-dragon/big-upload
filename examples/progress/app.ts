
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
        abortUpload(hash: string) {
            if (this.uploadFile) {
                this.uploadFile.abort(hash)
            }
        },
        removeUpload(hash: string) {
            if (this.uploadFile) {
                this.uploadFile.remove(hash)
            }
            for (let i = 0; i < this.fileList.length; i++) {
                if (this.fileList[i].hash === hash) {
                    this.fileList.splice(i, 1)
                    return
                }
            }
        },
        submitUpload() {
            if (this.uploadFile) {
                this.fileList.forEach((item: any) => item.isSubmit = true)
                this.uploadFile.submit()
            }
        },
        selectFile() {
            this.$refs.fileInput.click()
        },
        abortOrRemove(item: any) {
            if (item.percentage === 100) {
                this.removeUpload(item.hash)
                return
            }
            if (item.isSubmit) {
                this.abortUpload(item.hash)
            }else {
                this.removeUpload(item.hash)
            }
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
                chunkSize: .5 * 1024 * 1024,
                isAddUp: true,
                onChange(fileDataList) {
                    console.log('=============onChange=============')
                    console.log(fileDataList)
                    self.fileList = fileDataList.map(item => {
                        item.percentage = 0
                        item.isSubmit = false
                        return item
                    })
                },
                onBeforeUpload() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(true)
                        }, 100)
                    })
                },
                onProgress(data) {
                    // console.log('=============onProgress=============')
                    // console.log(data.percent + '%')
                    self.fileList.forEach((item, index) => {
                        if(item.hash === data.hash) {
                            self.fileList[index].percentage = data.percent
                        }
                        return
                    })
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
        })
    }
})
