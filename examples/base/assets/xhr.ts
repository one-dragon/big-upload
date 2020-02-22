
type Mehtods = 'GET' | 'get' | 'POST' | 'post'


export default function xhr(method: Mehtods, url: string, data?: any) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        if(method.toLowerCase() === 'get') {
            url = buildURL(url, data)
        }

        xhr.onerror = function error() {
            reject(
                new Error( `
                    error: Network Error, 
                    url: ${url}
                `)
            )
        }

        xhr.onload = function load() {
            if (xhr.status < 200 || xhr.status >= 300) {
                reject(
                    new Error(`
                        error: Request failed with status code ${xhr.status}, 
                        url: ${url}
                    `)
                )
                return
            }

            let responseData = xhr.responseText || xhr.response
            try {
                responseData = JSON.parse(responseData)
            } catch (error) {
                // do nothing
            }
            resolve(
                {
                    result: responseData
                }
            )
        }

        xhr.open(method.toUpperCase(), url, true)

        xhr.send()
    })

    function buildURL(url: string, params: any) {
        if(!params) {
            return url
        }

        let serializedParams: string
        let parts: string[] = []
        Object.keys(params).forEach(key => {
            let val = params[key]
            if(val === undefined || val === null) {
                return
            }

            let values = []
            if(Array.isArray(val)) {
                values = val
                key += '[]'
            }else {
                values = [val]
            }

            values.forEach(val => {
                if (Object.prototype.toString.call(val) === '[object Date]') {
                    val = val.toISOString()
                }
                if (Object.prototype.toString.call(val) === '[object Object]') {
                    val = JSON.stringify(val)
                }
                parts.push(`${key}=${val}`)
            })
        })
        serializedParams = parts.join('&')

        url += (url.lastIndexOf('?') !== -1 ? '&' : '?') + serializedParams

        return url
    }
}