
import { UploadRequestData, UploadConfig } from '../types'


export function saveLocalUploadRecord(data: UploadRequestData, config: UploadConfig): any {
    let hash = data.hash
    let currentHash = data.currentHash
    let key: any = isExist(hash)
    let val: any = getToJson(key)

    if (key && deleteLocalUploadRecord(key, config)) {
        key = false
    }

    if (key === false || val === false) {
        if(key !== false) {
            removeData(key)
        }
        key = hash + '$-$' + Date.now()
        val = {}
    }
    val[currentHash!] = true
    setData(key, JSON.stringify(val))
}

export function queyLocalUploadRecord(data: UploadRequestData, config: UploadConfig): boolean {
    let hash = data.hash
    let currentHash = data.currentHash
    let key: any = isExist(hash)
    let val: any = getToJson(key)

    if (key && deleteLocalUploadRecord(key, config)) {
        key = false
    }

    if (key === false || val === false) {
        return false
    }
    if (!val[currentHash!]) {
        return false
    }
    return true
}

export function deleteLocalUploadRecord(key: any, config: UploadConfig, isDirectDel?: boolean ): any {
    if (typeof key !== 'string') {
        key = isExist(key.hash)
    }

    if (key && isDirectDel) {
        removeData(key)
        return true
    }

    let t: string = key.split('$-$')[1]
    if (t && isDel(parseInt(t, 10), config.localRecordTime!)) {
        removeData(key)
        return true
    }
    return false
}



function getData(key: string): any {
    return localStorage.getItem(key)
}

function setData(key: string, val: string): void {
    localStorage.setItem(key, val)
}

function removeData(key: string): void {
    localStorage.removeItem(key)
}

function getToJson(key: string): any {
    let val = getData(key)
    if(!val) return false
    try {
        return JSON.parse(val)
    } catch (error) {
        return false
    }
}

function isExist(key: string): any {
    for (let i in localStorage) {
        if (Object.hasOwnProperty.call(localStorage, i) && i.indexOf(key) !== -1) {
            return i
        }
    }
    return false
}

function isDel(time: number, maxDay: number): boolean {
    let nowTime = Date.now()
    let dayTime = 1000 * 60 * 60 * 24
    if (((nowTime - time) / dayTime) > maxDay) {
        return true
    }
    return false
}