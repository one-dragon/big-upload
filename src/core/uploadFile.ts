
import SparkMD5 from 'spark-md5'
import xhr from './xhr'
import { UploadConfig, UploadRequestData } from '../types'
import { warn } from '../util/error'

export function uploadFile(config: UploadConfig) {
    const el: Element = config.el as Element
    let { 
        chunkSize = 1 * 1024 * 1024,
        name: fieldName = 'file'
    } = config
    el.addEventListener('change', async (ev: Event) => {
        const files: FileList | null = (ev.target as HTMLInputElement).files
        if (!files) return
        const postFiles = Array.prototype.slice.call(files)
        const promiseList = [] as Array<Promise<any>>
        for (let i = 0; i < postFiles.length; i++) {
            let file = postFiles[i]
            const hash = await getHash(file, file.name)
            promiseList.push(sliceFile(file, hash))
        }
        // const file: File = postFiles[0]
        // const hash = await getHash(file, file.name)
        // const promiseList = []
        // promiseList.push(sliceFile(file, hash))
        // sliceFile(file, hash)
        Promise.all(promiseList).then((...args) => {
            console.log('所有文件全部请求完成')
            console.log(args)
        })
    })

    async function sliceFile(file: File, hash: string) {
        const { size, name } = file
        const blobSlice = File.prototype.slice
        const chunkCount = Math.ceil(size / chunkSize)
        const xhrPromiseList = []
        for (let i = 0; i < chunkCount; i++) {
            let start = i * chunkSize
            let end = Math.min(size, start + chunkSize)
            let blob = blobSlice.call(file, start, end)
            let currentHash = await getHash(blob, name)
            let data: UploadRequestData = {
                name: name,
                index: i + 1,
                total: chunkCount,
                size: size,
                currentHash: currentHash,
                hash: hash
            }
            data[fieldName] = blob
            xhrPromiseList.push(xhr(config, data))
            // console.log(data)
        }
        return Promise.all(xhrPromiseList).then((...args) => {
            console.log('单个文件分片全部请求完成')
            console.log(args)
            return args
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

