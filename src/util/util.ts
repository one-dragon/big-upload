
const toString = Object.prototype.toString

export function isFile(val: any): val is File  {
    return toString.call(val) === '[object File]'
}

export function isBlob(val: any): val is Blob {
    return toString.call(val) === '[object Blob]'
}

export function isPlainObject(val: any): val is Object {
    return toString.call(val) === '[object Object]'
}

export function isURLSearchParams(val: any): val is URLSearchParams {
    return toString.call(val) === '[object URLSearchParams]'
}

export function isDate(val: any): val is Date {
    return toString.call(val) === '[object Date]'
}

export function noop(a?: any, b?: any, c?: any):void {
    // no thing
}

// 创建一个 map 并返回一个函数，用于检查 key 是否存在
export function makeMap(str: string, expectsLowerCase?: boolean): (key: string) => true | void {
    const map = Object.create(null)
    const list: Array<string> = str.split(',')
    for(let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

// 混合对象：把 from 里的属性扩展到 to 中
export function extend<T, U>(to: T, from: U): T & U {
    for(let key in from) {
        (to as T & U)[key] = from[key] as any
    }
    return to as T & U
}

// 递归深拷贝多个对象
export function deepMerge(...objs: any[]): any {
    const result = Object.create(null)

    objs.forEach(obj => {
        if(obj) {
            Object.keys(obj).forEach(key => {
                const val = obj[key]
                if(isPlainObject(val)) {
                    if(isPlainObject(result[key])) {
                        result[key] = deepMerge(result[key], val)
                    } else {
                        result[key] = deepMerge(val)
                    }
                }else {
                    result[key] = val
                }
            })
        }
    })

    return result
}