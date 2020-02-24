import { processAttrs } from '../../src/helpers/attrs'
import { UploadConfig } from '../../src/index'

describe('helpers: attrs', () => {
  test('should element add file attribute', () => {
    const config: UploadConfig = {}
    config.el = document.createElement('input')
    processAttrs(config)
    expect((config.el as HTMLInputElement).type).toBe('file')
    expect((config.el as HTMLInputElement).getAttribute('multiple')).toBe(null)
    expect((config.el as HTMLInputElement).getAttribute('name')).toBe(null)
    expect((config.el as HTMLInputElement).getAttribute('accept')).toBe(null)
  })

  test('should element add multiple attribute', () => {
    const config: UploadConfig = {}
    config.el = document.createElement('input')
    config.multiple = true
    processAttrs(config)
    expect((config.el as HTMLInputElement).getAttribute('multiple')).toBe('multiple')
  })

  test('should element add name attribute', () => {
    const config: UploadConfig = {}
    config.el = document.createElement('input')
    config.name = 'file'
    processAttrs(config)
    expect((config.el as HTMLInputElement).getAttribute('name')).toBe('file')
  })

  test('should element add accept attribute', () => {
    const config: UploadConfig = {}
    config.el = document.createElement('input')
    config.accept = 'image/*'
    processAttrs(config)
    expect((config.el as HTMLInputElement).getAttribute('accept')).toBe('image/*')
  })
})
