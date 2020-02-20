
import { UploadConfig } from '../types'
import { transformEl } from '../util/el'
import { transformRequestURL, transformRequestData } from '../util/request'
import { processAttrs } from '../util/attrs'
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