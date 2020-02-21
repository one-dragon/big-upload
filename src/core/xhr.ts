

import { UploadConfig, UploadRequestData, UploadResponse, UploadPromise, UploadProgressData } from '../types'
import { parseResponseHeaders, parseResponseData } from '../helpers/response'
import { createError } from '../helpers/error'

export default function xhr(config: UploadConfig, file: File): UploadPromise | any {
    if(typeof XMLHttpRequest === 'undefined') {
        return
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const { action, withCredentials, headers, timeout, name: fieldName } = config

        let hash = config.data.hash
        abortRequest()

        if (xhr.upload) {
            const { name, size, hash, totalCount, index, currentSize, currentHash } = config.data
            xhr.upload.onprogress = function onprogress(ev: ProgressEvent<EventTarget>) {
                if(abortRequest()) return

                if (config._singleFileProgress) {
                    const progressData = { name, size, hash, totalCount, index, currentSize, currentHash } as UploadProgressData
                    progressData.loaded = ev.loaded
                    progressData.total = ev.total
                    progressData.file = file
                    progressData.currentFile = config.data[fieldName!]
                    config._singleFileProgress(progressData)
                }
            }
        }
        
        const data: UploadRequestData = config.data
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            formData.append(key, data[key])
        })

        // 当网络出现异常（比如不通）的时候发送请求会触发 XMLHttpRequest 对象实例的 error 事件
        xhr.onerror = function onerror(this: XMLHttpRequest, ev: ProgressEvent) {
            reject(createError('Network Error', config, null, xhr)) // 获取不到 response
        }

        // 超时
        xhr.ontimeout = function ontimeout() {
            // ECONNABORTED: 网络请求术语，代表网络被终止
            reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', xhr)) // 获取不到 response
        }

        xhr.onload = function onload() {
            const response: UploadResponse = getResponse(xhr)
            if (xhr.status < 200 || xhr.status >= 300) {
                reject(
                    createError(
                        `Request failed with status code ${response.status}`,
                        config,
                        null,
                        xhr,
                        response
                    )
                )
            }else {
                resolve(response)
            }
        }

        xhr.open('POST', action!, true)

        if (withCredentials && 'withCredentials' in xhr) {
            xhr.withCredentials = true;
        }

        for (let item in headers) {
            if (headers.hasOwnProperty(item) && headers[item] !== null) {
                xhr.setRequestHeader(item, headers[item]);
            }
        }

        if (timeout) {
            xhr.timeout = timeout
        }

        xhr.send(formData)


        function abortRequest() {
            if (config._abortFile && config._abortFile[hash]) {
                xhr.abort()
                return true
            }
            return false
        }
    })

    function getResponse(xhr: XMLHttpRequest): UploadResponse {
        const responseHeaders = parseResponseHeaders(xhr.getAllResponseHeaders())
        const responseData = parseResponseData(xhr.responseText || xhr.response) // 得到一个 JSON 字符串 => 转换成对象类型
        const response: UploadResponse = {
            data: responseData,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: responseHeaders,
            config,
            request: xhr
        }
        return response
    }
}

