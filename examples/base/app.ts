
import upload from '../../src'
import xhr from './assets/xhr'

declare var Vue: any

let app = new Vue({
    el: '#app',
    data() {
        return {
            imgList: []
        }
    },
    mounted() {
        let _self = this
        this.$nextTick(() => {
            upload({
                el: '#file-input',
                action: '/upload',
                chunkSize: 2 * 1024 * 1024,
                multiple: true,
                accept: 'image/*',
                headers: {
                    test: 'just test',
                    test2: 'this is test'
                },
                onSuccess(response, fileData, file) {
                    // console.log('onSuccess===============')
                    // console.log(fileData)
                    xhr('get', '/mergeFile', fileData).then((d: any) => {
                        console.log(d)
                        if (d.result && d.result.result) {
                            _self.imgList.push({
                                url: d.result.result,
                                time: (new Date()).toISOString(),
                                name: fileData.name
                            })
                        }
                    })
                }
            })
        })
    }
})

