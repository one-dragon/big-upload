

import { UploadConfig } from '../types'

function defaultStrat(val1: any, val2: any): any {
    return typeof val2 !== 'undefined' ? val2 : val1
}

function fromVal2Strat(val1: any, val2: any): any {
    if(typeof val2 !== 'undefined') {
        return val2
    }
}

const strats = Object.create(null)

const stratKeysFromVal2 = ['el', 'action', 'data', 'params']
stratKeysFromVal2.forEach(key => {
    strats[key] = fromVal2Strat
})

export default function mergeConfig(
    config1: UploadConfig,
    config2: UploadConfig
): UploadConfig {
    if(!config2) {
        config2 = {}
    }

    const config = Object.create(null)

    // 优先循环 config2 进行配置合并
    for(let key in config2) {
        mergeField(key)
    }

    for(let key in config1) {
        if(!config2[key]) {
            mergeField(key)
        }
    }

    function mergeField(key: string): void {
        const strat = strats[key] || defaultStrat
        config[key] = strat(config1[key], config2[key])
    }

    return config
}