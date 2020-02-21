# big-upload
使用 TypeScript 实现大文件分片上传


## 使用

基本使用方法:

```javascript
import upload from 'big-upload'

// upload(el: string | element, action: string, config?: object)
upload('#el', '/upload')

// 或者

// upload(config: object)
upload({
  el: '#el',
  action: '/upload'
})
```

如果你不需在选取文件后立即进行上传，而是点击按钮上传，你应当使用 `.submit()`:

```javascript
import upload from 'big-upload'

const ul = upload({
  el: '#el',
  action: '/upload',
  autoUpload: false
})

document.querySelector('#btn').onclick = () => {
  ul.submit()
}
```


## API

### config 配置
参数 | 说明 | 类型 | 默认值
--- | --- | --- | ---
`el` | 必选参数，绑定元素 | string / element | --
`action` | 必选参数，上传的地址 | string | --
`data` | 上传时附带的额外参数 | object | --
`params` | url地址参数 | object / URLSearchParams  | --
`name` | 上传的文件字段名 | string | `file`
`chunkSize` | 设置每个文件分片大小 | number | `1 * 1024 * 1024`
`multiple` | 是否支持多选文件 | boolean | `false`
`accept` | 接受上传的文件类型 | string | --
`autoUpload` | 是否在选取文件后立即进行上传 | boolean | `true`
`withCredentials` | 支持发送 cookie 凭证信息 | boolean | `false`
`headers` | 设置上传的请求头部 | object | --
`timeout` | 设置超时时间 | number | `0`
`httpRequest` | 覆盖默认的上传行为，可以自定义上传的实现 | function | --
`onChange` | 选择文件后钩子 | function(fileData[]) | --
`onBeforeUpload` | 上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传 | function(fileData) | --
`onBeforeSliceFileUpload` | 上传分片文件之前的钩子，参数为上传的分片文件，若返回 false 或者返回 Promise 且被 reject，则停止上传 | function(fileData) | --
`onProgress` | 文件上传时的钩子 | function(progressData) | --
`onSuccess` | 单个文件上传成功时的钩子 | function(response, fileData, file) | --
`onComplete` | 所有文件上传成功时的钩子 | function(responseList, fileDataList, fileList) | --
`onError` | 分片文件上传失败时的钩子 | function(err, sliceFile, file) | --


### 钩子参数说明

#### fileData: object
name | 说明 | 类型 
--- | --- | --- 
`name` | 文件名称 | string
`size` | 文件大小 | number
`file` | 上传文件 | file
`hash` | 文件生成唯一的 md5 值 | string
`totalCount` | 文件可分片个数 | number
`index` | 当前上传分片文件的索引值 | number
`currentFile` | 当前上传的分片文件 | file / blob
`currentSize` | 当前上传的分片文件大小 | number
`currentHash` | 当前上传的分片文件生成唯一的 md5 值 | string

```javascript
// `xx?` 参数是针对分片文件内容，所以在 `onChange`、`onBeforeUpload` 钩子中不会有此参数
fileData: {
  name: string,
  size: number,
  file: file,
  hash: string,
  totalCount: number,
  index?: number,
  currentFile?: file / blob,
  currentSize?: number,
  currentHash?: string
}
```

#### progressData: object
name | 说明 | 类型 
--- | --- | --- 
`name` | 文件名称 | string
`size` | 文件大小 | number
`file` | 上传文件 | file
`hash` | 文件生成唯一的 md5 值 | string
`totalCount` | 文件可分片个数 | number
`index` | 当前上传分片文件的索引值 | number
`currentFile` | 当前上传的分片文件 | file / blob
`currentSize` | 当前上传的分片文件大小 | number
`currentHash` | 当前上传的分片文件生成唯一的 md5 值 | string
`loaded` | 当前上传的分片文件，已上传的大小 | number
`total` | 当前上传的分片文件，需要上传的总共大小 | number
`percent` | 文件的上传进度 | number

```javascript
fileData: {
  name: string,
  size: number,
  file: file,
  hash: string,
  totalCount: number,
  index: number,
  currentFile: file / blob,
  currentSize: number,
  currentHash: string,
  loaded: number,
  total: number,
  percent: number
}
```

#### response: []
name | 说明 | 类型 
--- | --- | --- 
`data` | 接口返回的响应数据 | object / any
`status` | 响应状态码 | number
`statusText` | 响应状态文字 | string
`headers` | 响应头 | object
`config` | 传入的 `config` 配置 | object
`request` | XMLHttpRequest 请求 | object

```javascript
// 返回多个分片文件的响应报文集合
// 分片文件的上传个数是根据上传文件的大小，和设置 `config.chunkSize` 的大小计算而得出结果
response: [
  {
    data: object / any,
    status: number,
    statusText: string,
    headers: object,
    config: object,
    request: object
  },
  ...
]
```

### Methods
方法 | 说明 | 参数 
--- | --- | --- 
`submit` | 上传已选中的文件 | --
`abort` | 取消上传请求 | (val: 可以是 file 文件，或者是 hash 文件生成唯一的 md5 值)
`disabled` | 是否禁用 | (val?: 不传值为禁用；传 true 为禁用；传 false 为不禁用)

