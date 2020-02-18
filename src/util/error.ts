
import { noop } from './util'

export let warn = noop

warn = (msg: string): void => {
    if(typeof console !== 'undefined') {
        console.error(`[warn]: ${msg}`)
    }
}
