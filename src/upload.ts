

import Upload from './core/Upload'
import defaults from './defaults'
import { extend } from './helpers/util'
import { UploadStatic, UploadConfig } from './types'
import mergeConfig from './core/mergeConfig'

function createInstance(config: UploadConfig): UploadStatic {
    const context = new Upload(config)
    const instance = Upload.prototype.request.bind(context)

    extend(instance, context)
    
    return instance as UploadStatic
}

const upload = createInstance(defaults)

upload.create = function create(config?: UploadConfig) {
    return createInstance(mergeConfig(defaults, config!))
}

export default upload