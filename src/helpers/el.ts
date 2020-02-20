
import { UploadConfig } from '../types'
import { warn } from './error'
import { makeMap } from './util'

export function transformEl(config: UploadConfig): Element {
    let el: Element = queryEl(config.el!)
    if (isFileInput(el)) {
        return el
    }else {
        const inputEL: Element = createElement('input')
        if (isUnaryTag(el.tagName)) {
            // insertBefore(el.parentNode!, inputEL, el)
            insertBefore(el.parentNode!, inputEL, null)
        }else {
            appendChild(el, inputEL)
        }
        return inputEL
    }
}

function queryEl(el: string | Element): Element {
    if (typeof el === 'string') {
        const selected = document.querySelector(el)
        if (!selected) {
            warn('Cannot find element: ' + el)
            return createElement('div')
        }
        return selected
    }else {
        return el
    }
}

function isFileInput(el: Element): boolean {
    return el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'file'
}

const isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr',
    true
)

function createElement(tagName: string): Element {
    return document.createElement(tagName)
}

function insertBefore(parentNode: Node, newNode: Node, referenceNode: Node | null): void {
    parentNode.insertBefore(newNode, referenceNode)
}

function appendChild(node: Node, child: Node) {
    node.appendChild(child)
}