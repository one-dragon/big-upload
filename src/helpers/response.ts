
// headers: 'date: Fri, 31 Jan 2020 10:44:01 GMT↵etag: W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k"↵connection: keep-alive↵x-powered-by: Express↵content-length: 13↵content-type: application/json; charset=utf-8↵'
export function parseResponseHeaders(headers: string): any {
    let parsed = Object.create(null)
    if(!headers) {
        return parsed
    }
    headers.split('\r\n').forEach(line => {
        let [key, ...vals] = line.split(':')
        key = key.trim().toLowerCase()
        if(!key) {
            return
        }
        const val = vals.join(':').trim()
        parsed[key] = val
    })
    return parsed
}

export function parseResponseData(data: any): any {
    try {
        return JSON.parse(data)
    } catch (e) {
        return data
    }
}