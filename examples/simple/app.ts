
import upload from '../../src/upload'

// 绑定原生
upload('#file-input', '/upload', {
    isLocalRecord: true,
    onChange() {
        alert('开始上传')
    }
})

// 绑定普通元素
upload('#other-element', '/upload', {
    onChange() {
        alert('开始上传')
    }
})

// 绑定自闭和标签
upload('#text-input', '/upload', {
    onChange() {
        alert('开始上传')
    }
})

// 绑定没定义标签
upload('#no-define', '/upload')


/*
let paramsString = "q=URLUtils.searchParams&topic=api"
let searchParams = new URLSearchParams(paramsString)
upload({
    el: '#app',
    action: '/upload',
    // params: {
    //     a: 1,
    //     b: [1, 2],
    //     c: { c: 1 },
    //     d: new Date(),
    //     str: '@:$, '
    // }
    params: searchParams
})
*/