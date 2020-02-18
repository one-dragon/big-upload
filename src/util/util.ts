
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