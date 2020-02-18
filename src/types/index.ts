
export interface UploadConfig {
    el: string | Element
    action: string
    name?: string
    chunkSize?: number
}

export interface UploadRequestData {
    name: string
    index: number
    total: number
    size: number
    currentHash: string
    hash: string

    [props: string]: any
}

export interface UploadResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: any
    config: UploadConfig
    request: XMLHttpRequest // XMLHttpRequest
}