
import { UploadConfig } from "../types";

export function processAttrs(config: UploadConfig) {
    const { multiple, name, accept } = config
    const el: Element = config.el as Element
    el.setAttribute('type', 'file')
    if (multiple) {
        el.setAttribute('multiple', 'multiple')
    }
    if (name) {
        el.setAttribute('name', name)
    }
    if (accept) {
        el.setAttribute('accept', accept)
    }
}