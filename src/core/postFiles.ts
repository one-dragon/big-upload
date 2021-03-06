
import SparkMD5 from 'spark-md5'
import { UploadConfig, UploadRequestData, UploadResponse, UploadError, UploadProgressData, UploadParamsData } from '../types'
import { warn } from '../helpers/error'
import { isBlob, isFile, deepMerge, isPlainObject } from '../helpers/util'
import { saveLocalUploadRecord, queyLocalUploadRecord, deleteLocalUploadRecord } from './saveLocalStorage'



function addProgressComputed(config: UploadConfig) { // 增加分片文件的进度计算
    const data = Object.create(null)

    config._singleFileProgress = (progressData: UploadProgressData, isUploadComplete?: boolean) => {
        if (isUploadComplete) {
            if (data[progressData.hash]) {
                delete data[progressData.hash]
            }
            return 
        }

        if (config.onProgress) {
            const { size, hash, index, currentSize, loaded, total } = progressData
            let d: any = data[hash]
            if (!d) {
                d = data[hash] = { size }
                d.loadedList = []
                d.startTime = new Date().getTime()
            }
            if (!d.loadedList[index!] && total > 0) { // 上传的total 可能会比当前分片文件 currentSize 体积大
                d.size += total - currentSize!
            }
            d.loadedList[index!] = loaded

            let totalLoaded = d.loadedList.reduce((total: number, next: number) => { return total + next }, 0)
            let percent = Number((totalLoaded / d.size * 100).toFixed(2))
            progressData.percent = percent >= 100 ? 100 : percent
            config.onProgress(progressData)
            // console.log(name + ' --index: ' + index + ' --loaded: ' + loaded + ' --totalLoaded: ' + totalLoaded + ' -- ' + size + ': ')
            // console.log(progressData.percent)
        }
    }
}


export default function postFiles(config: UploadConfig) {
    const el: HTMLInputElement = config.el as HTMLInputElement
    let { 
        chunkSize,
        name: fieldName,
        multiple,
        autoUpload,
        httpRequest,

        isAddUp,

        isLocalRecord,
        localRecordTime,
        onLocalRecord,

        onChange,
        onBeforeUpload,
        onBeforeSliceFileUpload,
        onSuccess,
        onComplete,
        onError
    } = config

    addProgressComputed(config)

    let fileList: any[] = []
    el.addEventListener('change', async (ev: Event) => {
        const files: FileList | null = (ev.target as HTMLInputElement).files
        if (!files) return

        const postFiles = Array.prototype.slice.call(files)
        if (!isAddUp) {
            fileList = postFiles
        } else {
            if (!fileList.length) {
                fileList = postFiles
            } else {
                let map = new Map()
                fileList.forEach(file => map.set(file.name, file))
                postFiles.forEach(file => {
                    if(!map.has(file.name)) {
                        map.set(file.name, file)
                    }
                })
                fileList = Array.from(map.values())
                map.clear()
            }
        }

        if (onChange) {
            const fileDataList: UploadRequestData[] = []
            for (let i = 0; i < fileList.length; i++) {
                let d: UploadParamsData = await genUploadParamsData(fileList[i])
                fileDataList.push(d)
            }
            onChange(fileDataList)
        }

        if (autoUpload) {
            uploadFiles(fileList)
        }
    })

    return {
        submit() {
            if(fileList.length) {
                uploadFiles(fileList)
                // fileList = []
            }else {
                // alert('没选择文件')
            }
        },
        async abort(val: File | string) {
            if(isBlob(val) || isFile(val)) {
                val = await getHash(val, val.name || '')
            }

            if (!config._abortFile) {
                config._abortFile = {}
            }
            config._abortFile[val] = true
        },
        async remove(val: File | string) {
            if (fileList.length) {
                let hash: any = val
                if (isFile(val)) {
                    hash = await getHash(val, val.name || '')
                }

                for(let i = 0; i < fileList.length; i++) {
                    if (hash === await getHash(fileList[i], fileList[i].name || '')) {
                        fileList.splice(i, 1)
                        return
                    }
                }
            }
        },
        disabled(val?: boolean) {
            if(val === false) {
                el.removeAttribute('disabled')
            }else {
                el.setAttribute('disabled', 'disabled')
            }
        }
    }

    async function uploadFiles(files: FileList | any[]) { // 上传文件前，循环文件进行上传
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
        fileList = []

        let fileHash = await getHash(file, file.name)

        if (!onBeforeUpload) {
            return sliceFile(file, fileHash)
        }

        // 上传文件之前钩子处理
        let d = await genUploadParamsData(file)
        const before = onBeforeUpload(d)
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
                    if (processedFile !== false) {
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

            const data: UploadRequestData = {
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
                post(config, file).then((res) => {
                    if (isLocalRecord) {
                        saveLocalUploadRecord(data, config)
                    }
                    return res
                }).catch((err: UploadError) => {
                    onError && onError(err, blob, file)
                    return Promise.reject(err)
                })
            )
        }

        return Promise.all(xhrPromiseList).then(async (...args) => {
            // console.log('单个文件分片全部请求完成')
            // console.log(args)
            config._singleFileProgress(config.data, true)
            const d: UploadParamsData = await genUploadParamsData(file)
            onSuccess && onSuccess(args[0], d, file)
            
            if (isLocalRecord) {
                deleteLocalUploadRecord(d, config, true)
            }

            return [args[0], d, file]
        })
    }

    async function post(config: UploadConfig, file: File): Promise<any> { // 上传单个分片文件前，判断钩子函数后上传
        if (!onBeforeSliceFileUpload) {
            if (isLocalRecord && queyLocalUploadRecord(config.data, config)) { // 设置 开启本地上传记录，并命中本地上传记录
                if (onLocalRecord) { // 命中本地上传记录前，调用钩子函数
                    const d: UploadParamsData = await genUploadParamsData(config.data, file)
                    const localRecord = onLocalRecord(d)
                    if (localRecord && localRecord.then) {
                        return localRecord.then((result: any) => {
                            if (result !== false) {
                                return httpRequest(config, file)
                            }
                            return progressCall()
                        })
                    } else if (localRecord !== false) {
                        return httpRequest(config, file)
                    } else {
                        return progressCall()
                    }
                }
                return progressCall()
            }
            return httpRequest(config, file)
        }

        // 上传分片文件之前钩子处理
        const d: UploadParamsData = await genUploadParamsData(config.data, file)
        const before = onBeforeSliceFileUpload(d)
        if (before && (before as Promise<any>).then) {
            return (before as Promise<any>).then(async (processedFile: any) => {
                if (isFile(processedFile) || isBlob(processedFile)) {
                    if (isFile(processedFile)) {
                        let arrayBuffer = await fileToAB(processedFile)
                        processedFile = new Blob([arrayBuffer])
                    }
                    config.data[fieldName!] = processedFile
                    return httpRequest(config, file)
                } else {
                    if (processedFile !== false) {
                        return httpRequest(config, file)
                    } else {
                        progressCall()
                    }
                }
            })
        } else if (before !== false) {
            return httpRequest(config, file)
        } else {
            progressCall()
        }

        function progressCall() {
            const { name, index, totalCount, size, currentSize, hash, currentHash } = config.data
            let d: UploadProgressData = { name, index, totalCount, size, currentSize, hash, currentHash, loaded: currentSize, total: currentSize, file, currentFile: config.data[fieldName!] }
            config._singleFileProgress(d)
        }
    }

    // 生成 UploadParamsData 格式数据
    function genUploadParamsData(data: any, file?: File): Promise<UploadParamsData> {
        // file、currentFile、hash、currentHash、size、currentSize、index、name、totalCount
        return new Promise(async (resolve, reject) => {
            if (isFile(data)) {
                file = data
                const { name, size } = file
                const totalCount = Math.ceil(size / chunkSize!)
                const hash = await getHash(file, name)
                resolve({ name, totalCount, hash, size, file })
            }else {
                if (isPlainObject(data) && file) {
                    const { name, index, totalCount, currentSize, size, currentHash, hash } = data as UploadRequestData
                    const d: UploadParamsData = { name, index, totalCount, currentHash, hash, currentSize, size, file }
                    d.currentFile = data[fieldName!]
                    resolve(d)
                    return
                }
                reject('error')
            }
        })
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

