
import { noop } from './util'
import { UploadConfig, UploadResponse } from '../types'


export class UploadError extends Error {
    isUploadError: boolean
    config: UploadConfig
    code?: string | null
    request?: any // XMLHttpRequest
    response?: UploadResponse

    constructor(
        message: string,
        config: UploadConfig,
        code?: string | null,
        request?: any,
        response?: UploadResponse
    ) {
        super(message)
        this.isUploadError = true
        this.config = config
        this.code = code
        this.request = request
        this.response = response

        // 当继承一些内置对象，如：Error、Array、Map 时
        // 实例化后，访问不到原型方法，并 instanceof 也为 false（构造函数的属性、方法能访问到）
        // 使用 setPrototypeOf 能修复以上问题
        Object.setPrototypeOf(this, UploadError.prototype)
    }
}

// 工厂方法
export function createError(
    message: string,
    config: UploadConfig,
    code?: string | null,
    request?: any,
    response?: UploadResponse
) {
    const error = new UploadError(message, config, code, request, response)
    return error
}


export let warn = noop
warn = (msg: string): void => {
    if(typeof console !== 'undefined') {
        console.error(`[warn]: ${msg}`)
    }
}
