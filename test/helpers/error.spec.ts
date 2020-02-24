import { createError } from '../../src/helpers/error'
import { UploadConfig, UploadResponse } from '../../src/index'

interface ResponseData<T = any> {
  msg: string
  result: T
}
interface User {
  name: string
  age: number
}

describe('helpers: error', () => {
  test('createError', () => {
    let request = new XMLHttpRequest()
    let config: UploadConfig = {
      el: '#el',
      action: '/upload'
    }
    let response: UploadResponse<ResponseData<User>> = {
      data: {
        msg: 'ok',
        result: { name: 'syl', age: 27 }
      },
      status: 200,
      statusText: 'OK',
      headers: null,
      request,
      config
    }
    let error = createError('create error', config, 'SONETHING', request, response)

    expect(error instanceof Error).toBeTruthy()
    expect(error.message).toBe('create error')
    expect(error.config).toBe(config)
    expect(error.code).toBe('SONETHING')
    expect(error.request).toBe(request)
    expect(error.response).toBe(response)
    expect(error.isUploadError).toBeTruthy()
  })
})
