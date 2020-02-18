
import { UploadConfig } from './types'
import { transformEl } from './util/el'
import { uploadFile } from './core/uploadFile'

export function upload(config: UploadConfig) {
    processConfig(config)
    uploadFile(config)
}

function processConfig(config: UploadConfig): void{
    config.el = transformEl(config)
    
}