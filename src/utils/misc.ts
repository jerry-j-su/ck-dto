export function simpleUID(letter: number) {
    const letterCount = (!Number.isInteger(letter) || letter < 6 || letter > 11) ? 6 : letter
    return Math.random().toString(32).substring(2, 2 + letterCount)
}

/**
 * Merge multiple class names into a consumable className property
 * @param {string[]} classNames
 */
export function mergeClassNames(classNames: (string | undefined)[]) {
    if (!Array.isArray(classNames)) return ''
    return classNames.filter(Boolean).join(' ')
}

/**
 * A simple helper to transform a function to tailing debounced version, avoid cost of high-frequency input
 * @param {Function} func
 * @param {number} wait - waiting time (in ms) to delay the execution
 */
export function tailingDebounce(func: Function, wait: number) {
    let timerId: number
    let latestArgs: any[]
    let latestThis: any

    function startTimer() {
        window.clearTimeout(timerId)
        timerId = window.setTimeout(() => {
            func.apply(latestThis, latestArgs)
        }, wait)
    }

    function debounced(...args: any[]) {
        latestArgs = args
        // @ts-ignore
        latestThis = this
        startTimer()
    }

    return debounced
}

export const observeDOM = (() => {
    const MutationObserver = window.MutationObserver

    return function (ele: HTMLElement, callback: Function) {
        if (!(ele instanceof HTMLElement) || ele.nodeType !== 1) return

        if (MutationObserver) {
            const mutationObserver = new MutationObserver(() => {
                callback()
            })

            // have the observer observe for DOM changes in children
            mutationObserver.observe(ele, { childList: true, subtree: true })
            return mutationObserver
        }

        // Older browser that does not support MutationObserver
        else if (ele.addEventListener) {
            ele.addEventListener('DOMNodeInserted', callback as EventListener, false)
            ele.addEventListener('DOMNodeRemoved', callback as EventListener, false)
        }
    }
})()
