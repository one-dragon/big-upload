
import { UploadConfig } from './types'

const defaults: UploadConfig = {
    name: 'file',

    chunkSize: 1 * 1024 * 1024,

    multiple: false,

    autoUpload: true
}

export default defaults