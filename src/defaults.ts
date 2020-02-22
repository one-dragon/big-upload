
import { UploadConfig } from './types'
import xhr from './core/xhr'

const defaults: UploadConfig = {
    name: 'file',

    chunkSize: 1 * 1024 * 1024,

    multiple: false,

    autoUpload: true,

    withCredentials: false,

    headers: {},
    
    timeout: 0,

    httpRequest: xhr,

    isLocalRecord: false,
    localRecordTime: 15,

    isAddUp: false
}

export default defaults