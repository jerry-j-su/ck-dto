export function simpleUID(letter: number) {
    const letterCount =  (!Number.isInteger(letter) || letter < 6 || letter > 11) ? 6 : letter
    return Math.random().toString(32).substring(2, 2 + letterCount);
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
        startTimer();
    }

    return debounced
}