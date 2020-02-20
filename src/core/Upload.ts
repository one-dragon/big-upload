
import { UploadConfig } from '../types'
import mergeConfig from './mergeConfig'
import dispatchUpload from './dispatchUpload'

export default class Upload {
    defaults: UploadConfig

    constructor(initConfig: UploadConfig) {
        this.defaults = initConfig
    }

    request(el: any, action?: any, config?: any) {
        if (typeof el === 'string') {
            if(typeof action === 'string') {
                config = config || {}
                config.el = el
                config.action = action
            }else {
                config = action
                config.el = el
            }
        }else {
            config = el
        }

        config = mergeConfig(this.defaults, config)

        return dispatchUpload(config)
    }
}