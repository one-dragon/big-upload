
import { isFile, isBlob, isPlainObject, isURLSearchParams, isDate } from './util'


// encode 编码
function encode(val: string): string {
    // 对于字符 @ : $ ,   [ ] 不encode
    // 并把'空格'转换成 '+'
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%20/g, '+') // 把'空格'转换成 '+'
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']')
}

// 处理请求 url 参数，最终生成如：/base/get?foo=bar
/*  默认
    params: {
        foo: ['bar', 'baz'], // ?foo[]=bar&foo[]=baz
        bar: { foo: 'foo' }, // ?bar=%7B%22foo%22:%22foo%22%7D，bar 后面拼接的是 { foo: 'foo' } encode 后的结果
        date: new Date(), // ?date=2019-04-01T05:55:39.030Z，date 后面拼接的是 date.toISOString() 的结果
        str: '@:$, ', // ?str=@:$,+，注意我们会把空格 转换成 +，对于字符 @、:、$、,、、[、]，我们是允许出现在 url 中的，不希望被 encode
        str1: null // 对于值为 null 或者 undefined 的属性，我们是不会添加到 url 参数中的
    }
    丢弃 url 中的哈希标记，如: url: '/base/get#hash' => '/base/get'
    保留 url 中已存在的参数，如: url: '/base/get?foo=bar' => '/base/get?foo=bar'
*/
export function transformRequestURL(action: string, params?: any): any {
    if(!params) {
        return action
    }

    let serialized

    if (isURLSearchParams(params)) {
        serialized = params.toString()
    }else {
        let part: string[] = []
        Object.keys(params).forEach(key => {
            let val = params[key]
            if (val === null || val === undefined) {
                return
            }
            let values = []
            if (Array.isArray(val)) {
                values = val
                key += '[]'
            } else {
                values = [val]
            }
            values.forEach(val => {
                if (isDate(val)) {
                    val = val.toISOString()
                } else if (isPlainObject(val)) {
                    val = JSON.stringify(val)
                }
                part.push(`${encode(key)}=${encode(val)}`)
            })
        })
        serialized = part.join('&')
    }
    
    if(serialized) {
        let hashIndex = action.indexOf('#')
        if (hashIndex !== -1) {
            action = action.slice(0, hashIndex)
        }
        action += (action.indexOf('?') === -1 ? '?' : '&') + serialized
    }

    return action
}

export function transformRequestData(data: any): any {
    let d = Object.create(null)
    if(!data) {
        return d
    }

    if(isPlainObject(data)) {
        for(let key in data) {
            let val = data[key]
            if(typeof val === 'string' || isFile(val) || isBlob(val)) {
                d[key] = val
            }else {
                try {
                    d[key] = JSON.stringify(val)
                } catch (error) {
                    d[key] = val
                }
            }
        }
    }
    
    return d
}