import { transformRequestURL, transformRequestData } from '../../src/helpers/request'

describe('helpers: request', () => {
  describe('transformRequestURL', () => {
    test('should support null params', () => {
      let url = transformRequestURL('/upload')
      expect(url).toBe('/upload')
    })

    test('should support URLSearchParams', () => {
      let params = new URLSearchParams('foo=bar&bar=baz')
      expect(transformRequestURL('/upload', params)).toBe('/upload?foo=bar&bar=baz')
    })

    test('should support object params', () => {
      expect(
        transformRequestURL('/upload', {
          foo: { bar: 'baz' }
        })
      ).toBe('/upload?foo=' + encodeURI('{"bar":"baz"}'))
    })
  })
})
