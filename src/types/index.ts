
export interface UploadConfig {
    el?: string | Element // upload.request(el, action?, config?) 中 el 必传，所以 config.el 可以选传
    action?: string
    data?: any
    params?: any
    name?: string
    chunkSize?: number
    multiple?: boolean
    accept?: string
    autoUpload?: boolean

    onChange?: (fileData: UploadRequestData[]) => any
    onBeforeUpload?: (file: File) => boolean | Promise<any>
    onBeforeSliceFileUpload?: (data: UploadRequestData) => boolean | Promise<any>
    onProgress?: (data: ProgressData) => any
    onSuccess?: (response: UploadResponse[], fileData: UploadRequestData, file: File) => any
    onComplete?: (responseList: UploadResponse[][], fileDataList: UploadRequestData[], fileList: File[]) => any
    onError?: (err: UploadError, sliceFile: File | Blob, file: File) => any

    [propName: string]: any
}

export interface Upload {
    request(config: UploadConfig): any
}

export interface UploadInstance extends Upload {
    (config: UploadConfig): any
    (el: any, action?: any, config?: UploadConfig): any
}

export interface UploadRequestData {
    name: string
    index?: number
    totalCount?: number
    currentSize?: number
    size: number
    currentHash?: string
    hash: string

    [propName: string]: any
}

export interface UploadResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: any
    config: UploadConfig
    request: XMLHttpRequest // XMLHttpRequest
}

// 那么 resolve 函数中的参数就是一个 UploadResponse 类型
export interface UploadPromise<T = any> extends Promise<UploadResponse<T>> {

}

// 错误信息 error 接口定义
export interface UploadError extends Error {
    isUploadError: boolean
    config: UploadConfig
    code?: string | null
    request?: any // XMLHttpRequest
    response?: UploadResponse
}

export interface ProgressData extends UploadRequestData {
    percent?: number
    loaded: number
    total: number
    file: File
    currentFile: File | Blob
}