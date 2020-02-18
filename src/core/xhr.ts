

import { UploadConfig, UploadRequestData, UploadResponse } from '../types'
import { parseResponseHeaders, parseResponseData } from '../util/response'

export default function xhr(config: UploadConfig, data: UploadRequestData): Promise<any> | void {
    if(typeof XMLHttpRequest === 'undefined') {
        return
    }
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        const { action } = config

        /*
            if (xhr.upload) {
                xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = e.loaded / e.total * 100
                }
                option.onProgress(e)
                }
            }
        */
        const formData = new FormData()
        Object.keys(data).forEach(key => {
            formData.append(key, data[key])
        })

        xhr.onerror = function error(this: XMLHttpRequest, ev: ProgressEvent) {
            // option.onError(e)
        }

        xhr.onload = function onload() {
            const response: UploadResponse = getResponse(xhr)
            // if (xhr.status < 200 || xhr.status >= 300) {
            //     return option.onError(getError(action, option, xhr))
            // }
            // option.onSuccess(getBody(xhr))
            resolve(response)
        }

        xhr.open('POST', action, true)

        // if (option.withCredentials && 'withCredentials' in xhr) {
        //     xhr.withCredentials = true;
        // }

        // const headers = option.headers || {};

        // for (let item in headers) {
        //     if (headers.hasOwnProperty(item) && headers[item] !== null) {
        //         xhr.setRequestHeader(item, headers[item]);
        //     }
        // }
        xhr.send(formData)
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

// function getError(action, option, xhr) {
//     let msg;
//     if (xhr.response) {
//         msg = `${xhr.response.error || xhr.response}`;
//     } else if (xhr.responseText) {
//         msg = `${xhr.responseText}`;
//     } else {
//         msg = `fail to post ${action} ${xhr.status}`;
//     }

//     const err = new Error(msg);
//     err.status = xhr.status;
//     err.method = 'post';
//     err.url = action;
//     return err;
// }


// function getBody(xhr: XMLHttpRequest) {
//     const text = xhr.responseText || xhr.response;
//     if (!text) {
//         return text;
//     }

//     try {
//         return JSON.parse(text);
//     } catch (e) {
//         return text;
//     }
// }