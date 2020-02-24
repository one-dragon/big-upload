import { transformEl } from '../../src/helpers/el'
import { UploadConfig } from '../../src/index'

describe('helpers: el', () => {
  let config: UploadConfig = {}

  test('should return the value passed in', () => {
    let el = document.createElement('input')
    el.setAttribute('type', 'file')
    config.el = el

    expect(transformEl(config)).toBe(config.el)

    config = {}
  })

  test('should returns the elements of the query', () => {
    let el = document.createElement('input')
    el.setAttribute('type', 'file')
    el.id = 'file-input'
    document.body.appendChild(el)
    config.el = '#file-input'

    expect(transformEl(config)).toBe(el)

    config = {}
  })

  test('should create file input with parent element name div', () => {
    config.el = '#no-element'

    expect(transformEl(config).tagName).toBe('INPUT')
    expect(transformEl(config).parentElement!.tagName).toBe('DIV')

    config = {}
  })

  test('should Insert after unary element', () => {
    let div = document.createElement('div')
    document.body.appendChild(div)
    let input = document.createElement('input')
    input.id = 'text-input'
    div.appendChild(input)
    config.el = '#text-input'
    let el = transformEl(config)

    expect(el.id).toBe('')
    expect(el.previousElementSibling!).toBe(input)
    expect(el.parentElement!.tagName).toBe('DIV')

    config = {}
  })
})
