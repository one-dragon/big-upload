

import Upload from './core/Upload'
import defaults from './defaults'
import { extend } from './util/util'
import { UploadInstance, UploadConfig } from './types'

function createInstance(config: UploadConfig): UploadInstance {
    const context = new Upload(config)
    const instance = Upload.prototype.request.bind(context)

    extend(instance, context)
    
    return instance as UploadInstance
}

const upload = createInstance(defaults)

export default upload