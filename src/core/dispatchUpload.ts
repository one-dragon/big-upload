
import { UploadConfig } from '../types'
import { transformEl } from '../helpers/el'
import { transformRequestURL, transformRequestData } from '../helpers/request'
import { processAttrs } from '../helpers/attrs'
import postFiles from '../core/postFiles'

export default function dispatchUpload(config: UploadConfig) {
    processConfig(config)
    processAttrs(config)
    return postFiles(config)
}

function processConfig(config: UploadConfig): void {
    config.el = transformEl(config)
    config.action = transformRequestURL(config.action!, config.params)
    config.data = transformRequestData(config.data)

}