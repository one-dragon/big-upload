

import upload from '../../src'

upload({
    el: '#file-input',
    action: '/upload',
    data: {
        foo: 'bar',
        bar: 'baz'
    },
    params: {
        foo: 'bar',
        bar: ['bar', 'baz'],
        date: new Date(),
        str: '@:$, '
    }
})