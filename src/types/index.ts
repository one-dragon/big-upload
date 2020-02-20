
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
    withCredentials?: boolean
    headers?: any
    timeout?: number
    httpRequest?: any

    onChange?: (fileData: UploadParamsData[]) => any
    onBeforeUpload?: (fileData: UploadParamsData) => boolean | Promise<any>
    onBeforeSliceFileUpload?: (fileData: UploadParamsData) => boolean | Promise<any>
    onProgress?: (data: UploadProgressData) => any
    onSuccess?: (response: UploadResponse[], fileData: UploadParamsData, file: File) => any
    onComplete?: (responseList: UploadResponse[][], fileDataList: UploadParamsData[], fileList: File[]) => any
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

export interface UploadStatic extends UploadInstance {
    create(config?: UploadRequestData): UploadInstance
}

export interface UploadCallReturnFn {
    submit(): any
    abort(val: File | string): any
    disabled(): any
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

export interface UploadParamsData extends UploadRequestData {
    file?: File
    currentFile?: File | Blob
}

export interface UploadProgressData extends UploadRequestData {
    percent?: number
    loaded: number
    total: number
    file: File
    currentFile: File | Blob
}