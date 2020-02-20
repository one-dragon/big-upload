
import SparkMD5 from 'spark-md5'
import xhr from './xhr'
import { UploadConfig, UploadRequestData, UploadResponse, UploadError, ProgressData } from '../types'
import { warn } from '../util/error'
import { isBlob, isFile, deepMerge } from '../util/util'

function addProgressComputed(config: UploadConfig) { // 增加分片文件的进度计算
    const data = Object.create(null)
    config._singleFileProgress = (pro: ProgressData, isUploadComplete?: boolean) => {
        if (isUploadComplete) {
            delete data[pro.hash]
            return 
        }

        const { name, index, hash, size, currentSize, total, loaded, file, currentFile } = pro
        let d: any
        d = data[hash]
        if(!d) {
            d = data[hash] = { size, file, currentFile }
            d.loadedList = []
            d.startTime = new Date().getTime()
        }
        if (!d.loadedList[index!] && total > 0) { // 上传的total 可能会比当前分片文件 currentSize 体积大
            d.size += total - currentSize!
        }
        d.loadedList[index!] = loaded

        let totalLoaded = d.loadedList.reduce((total: number, next: number) => { return total + next }, 0)
        let percent = Number((totalLoaded / d.size * 100).toFixed(2))
        d.percent = percent >= 100 ? 100 : percent
        pro.percent = d.percent
        config.onProgress && config.onProgress(pro)
        // console.log(currentSize + '------' + total )
        // console.log(pro)
        // console.log(name + ' --index: ' + index + ' --loaded: ' + loaded + ' --totalLoaded: ' + totalLoaded + ' -- ' + size + ': ')
        // console.log(d.percent)
        // if (d.percent === 100) {
        //     console.log('时间: ' + (new Date().getTime() - d.startTime))
        // }
    }
}


export default function postFiles(config: UploadConfig) {
    const el: HTMLInputElement = config.el as HTMLInputElement
    let { 
        chunkSize,
        name: fieldName,
        multiple,
        autoUpload,
        onChange,
        onBeforeUpload,
        onBeforeSliceFileUpload,
        onSuccess,
        onComplete,
        onError
    } = config

    addProgressComputed(config)

    let fileList: any
    el.addEventListener('change', async (ev: Event) => {
        const files: FileList | null = (ev.target as HTMLInputElement).files
        if (!files) return
        fileList = files

        if (onChange) {
            const fileDataList = []
            for(let i = 0; i < files.length; i++) {
                const file = Array.prototype.slice.call(files)[i]
                const { name, size } = file
                const chunkCount = Math.ceil(size / chunkSize!)
                const hash = await getHash(file, name)
                fileDataList.push({ name, size, chunkCount, hash, file })
            }
            onChange(fileDataList)
        }

        if (autoUpload) {
            uploadFiles(files)
        }
    })

    return {
        submit() {
            if(fileList) {
                uploadFiles(fileList)
                fileList = null
            }else {
                // alert('没选择文件')
            }
        },
        async remove(val: File | string) {
            if(isBlob(val) || isFile(val)) {
                val = await getHash(val, val.name || '')
            }

            if (!config._removeFile) {
                config._removeFile = {}
            }
            config._removeFile[val] = true
        }
    }

    async function uploadFiles(files: FileList) { // 上传文件前，循环文件进行上传
        let postFiles = Array.prototype.slice.call(files)
        if (!multiple) { postFiles = postFiles.slice(0, 1) }

        if (postFiles.length === 0) return

        const promiseList = [] as Array<Promise<any>>
        for (let i = 0; i < postFiles.length; i++) {
            promiseList.push(upload(postFiles[i]))
        }

        Promise.all(promiseList).then((...args) => {
            // console.log('所有文件全部请求完成')
            // console.log(args[0])
            if (onComplete) {
                let list = args[0]
                let responseList: UploadResponse[][] = []
                let fileDataList: any[] = []
                let fileList: File[] = []
                list.forEach(arr => {
                    responseList.push(arr[0])
                    fileDataList.push(arr[1])
                    fileList.push(arr[2])
                })
                onComplete(responseList, fileDataList, fileList)
            }
        })
    }

    async function upload(file: File) { // 上传单个文件前，判断钩子函数后上传
        el.value = ''
        let fileHash = await getHash(file, file.name)

        if (!onBeforeUpload) {
            return sliceFile(file, fileHash)
        }

        // 上传文件之前钩子处理
        const before = onBeforeUpload(file)
        if (before && (before as Promise<any>).then) {
            return (before as Promise<any>).then((processedFile: any) => {
                if (isFile(processedFile) || isBlob(processedFile)) {
                    if (isBlob(processedFile)) {
                        processedFile = new File([processedFile], file.name, {
                            type: file.type
                        })
                    }
                    for (const p in file) { // 把选中上传文件设置的属性，赋值给新生成的文件
                        if (file.hasOwnProperty(p)) {
                            processedFile[p] = (file as any)[p]
                        }
                    }
                    return sliceFile(processedFile, fileHash)
                } else {
                    if (processedFile) {
                        return sliceFile(file, fileHash)
                    }
                }
            })
        } else if (before !== false) {
            return sliceFile(file, fileHash)
        }
    }

    async function sliceFile(file: File, fileHash: string) { // 单个文件进行计算，进行文件分片上传
        const { size, name } = file
        const blobSlice = File.prototype.slice
        const chunkCount = Math.ceil(size / chunkSize!)
        
        const xhrPromiseList = []
        for (let i = 0; i < chunkCount; i++) {
            let start = i * chunkSize!
            let end = Math.min(size, start + chunkSize!)
            let blob = blobSlice.call(file, start, end)
            let currentHash = await getHash(blob, name)
            let data: UploadRequestData = {
                name: name,
                index: i + 1,
                totalCount: chunkCount,
                currentSize: end - start,
                size: size,
                currentHash: currentHash,
                hash: fileHash,
            }
            data[fieldName!] = blob
            
            config.data = deepMerge(config.data, data)

            xhrPromiseList.push(
                post(config, file).catch((err: UploadError) => {
                    onError && onError(err, blob, file)
                    return Promise.reject(err)
                })
            )
            // console.log(data)
        }

        return Promise.all(xhrPromiseList).then((...args) => {
            // console.log('单个文件分片全部请求完成')
            // console.log(args)
            config._singleFileProgress(config.data, true)
            let d = {
                name: name,
                totalCount: chunkCount,
                size: size,
                hash: fileHash
            }
            onSuccess && onSuccess(args[0], d, file)
            // return args[0]
            return [args[0], d, file]
        })
    }

    function post(config: UploadConfig, file: File): any { // 上传单个分片文件前，判断钩子函数后上传
        if (!onBeforeSliceFileUpload) {
            return xhr(config, file)
        }

        // 上传分片文件之前钩子处理
        const before = onBeforeSliceFileUpload(config.data)
        if (before && (before as Promise<any>).then) {
            return (before as Promise<any>).then(async (processedFile: any) => {
                if (isFile(processedFile) || isBlob(processedFile)) {
                    if (isFile(processedFile)) {
                        let arrayBuffer = await fileToAB(processedFile)
                        processedFile = new Blob([arrayBuffer])
                    }
                    config.data[fieldName!] = processedFile
                    return xhr(config, file)
                } else {
                    if (processedFile) {
                        return xhr(config, file)
                    }else {
                        progressCall()
                    }
                }
            })
        } else if (before !== false) {
            return xhr(config, file)
        } else {
            progressCall()
        }

        function progressCall() {
            const { name, index, totalCount, size, currentSize, hash, currentHash } = config.data
            let d: ProgressData = { name, index, totalCount, size, currentSize, hash, currentHash, loaded: currentSize, total: currentSize, file, currentFile: config.data[fieldName!] }
            config._singleFileProgress(d)
        }
    }
}


function getHash(blob: Blob, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const spark = new SparkMD5.ArrayBuffer()
        const fileReader = new FileReader()
        fileReader.onload = async (ev: ProgressEvent<FileReader>) => {
            let arrayBuffer: ArrayBuffer = await strToAB(fileName) // 防止内容相同文件名不同时，生成同一个hash
            spark.append(arrayBuffer)
            spark.append(ev.target!.result as ArrayBuffer)
            let hash = spark.end()
            resolve(hash)
        }
        fileReader.onerror = (ev: ProgressEvent<FileReader>) => {
            warn(`${fileName} - File read failed`)
            reject(fileName)
            // console.log(ev.target!.error?.message)
        }
        fileReader.readAsArrayBuffer(blob)
    })
}

function strToAB(str: string): Promise<ArrayBuffer> {
    return new Promise(resolve => {
        const blob = new Blob([str], { type: 'text/plain' })
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(blob)
        fileReader.onload = (ev: ProgressEvent<FileReader>) => {
            resolve(ev.target!.result as ArrayBuffer)
        }
    })
}

function fileToAB(file: File): Promise<ArrayBuffer> {
    return new Promise(resolve => {
        const fileReader = new FileReader()
        fileReader.readAsArrayBuffer(file)
        fileReader.onload = (ev: ProgressEvent<FileReader>) => {
            resolve(ev.target!.result as ArrayBuffer)
        }
    })
}

