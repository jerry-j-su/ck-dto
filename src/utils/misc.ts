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

type DebounceOptions = {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
}
type DebouncedFunction<R> = (...args: any[]) => R
type ThrottleOptions = Omit<DebounceOptions, 'maxWait'>
type ThrottledFunction<R> = (...args: any[]) => R
/**
 * Transform a function to its trailing debounced variant, avoid cost of high-frequency input
 * @param {Function} func - function to be debounced
 * @param {number} wait - waiting time (in ms) to delay the execution
 * @param {boolean} [options.leading = false] - execute at leading edge
 * @param {boolean} [options.trailing = true] - execute at trailing edge
 * @param {boolean} [options.maxWait] - the maximum interval between each debounced executions
 */
export function debounce<R>(
    func: (...args: any[]) => R,
    wait: number,
    { leading = false, trailing = true, maxWait = 0 }: DebounceOptions = {},
): DebouncedFunction<R> {
    let timerId: number
    let latestArgs: any
    let latestThis: Object
    let isWaiting = false
    let invokeNow: (...args: any[]) => R
    let lastExecTime: number
    let lastResult: R
    const maxWaitIsSet = Number.isInteger(maxWait) && maxWait > 0

    function shouldInvokeNow() {
        return !isWaiting && leading
    }

    function resetCycleForLongPause() {
        // check if previous wait is long enough to reset the cycle
        if (maxWaitIsSet && lastExecTime && Date.now() - lastExecTime > maxWait) {
            isWaiting = false
            lastExecTime = Date.now()
        }
    }

    function startTimer() {
        // clear current timer
        window.clearTimeout(timerId)

        // calculate waiting time
        let timeSinceLastExec = lastExecTime ? Date.now() - lastExecTime : 0
        let remainingWait = maxWaitIsSet
            ? Math.min(wait, maxWait - timeSinceLastExec)
            : wait

        timerId = window.setTimeout(() => {
            // trailing edge
            if (trailing) {
                lastResult = invokeNow.apply(latestThis, latestArgs)
                lastExecTime = Date.now()
            }

            isWaiting = (leading && trailing && maxWaitIsSet)
                ? true
                : false
        }, remainingWait)
    }

    // this is the debounced method to invoke original execution at a timely manner
    function debounced(this: Object, ...args: any[]): R {
        resetCycleForLongPause()
        // leading edge
        if (shouldInvokeNow()) {
            lastResult = func.apply<Object, any[], R>(this, args)
            lastExecTime = Date.now()
        }
        invokeNow = func
        latestThis = this
        latestArgs = args
        isWaiting = true
        startTimer()
        return lastResult
    }

    return debounced
}

/**
 * Transform a function to its throttled variant, cap the frequency of execution
 * @param {Function} func - function to be debounced
 * @param {number} wait - waiting time (in ms) to delay the execution
 * @param {boolean} [options.leading = true] - execute at leading edge
 * @param {boolean} [options.trailing = true] - execute at trailing edge
 */
export function throttle<R>(
    func: (...args: any[]) => R,
    wait: number,
    { leading = true, trailing = true }: ThrottleOptions = {},
): ThrottledFunction<R> {
    return debounce(func, wait, { leading, trailing, maxWait: wait })
}

export const observeDOM = (() => {
    const MutationObserver = window.MutationObserver

    return function (ele: HTMLElement, callback: Function) {
        if (!(ele instanceof HTMLElement) || ele.nodeType !== 1) return

        if (MutationObserver) {
            const mutationObserver = new MutationObserver((mutationList: MutationRecord[]) => {
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
