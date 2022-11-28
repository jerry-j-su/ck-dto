import { simpleUID, tailingDebounce } from '../utils';

describe('Utilities and helpers', () => {

    test('simpleUID can generate an unique ID with specified letter count', () => {
        const uid1 = simpleUID(10)
        const uid2 = simpleUID(10)
        const uid3 = simpleUID(10)
        expect(uid1.length).toBe(10)
        expect(uid2.length).toBe(10)
        expect(uid3.length).toBe(10)
        expect(uid1).not.toBe(uid2)
        expect(uid1).not.toBe(uid3)
        expect(uid2).not.toBe(uid3)
    })

    test('tailingDebounce and debounce a frequent action a tailing-edge manner', async () => {
        let i = 0;
        let j = 0
        const bumpI = () => i ++
        const bumpJ = () => j ++
        const debouncedBumpI = tailingDebounce(bumpI, 500)

        const timerId = setInterval(() => {
            // "i ++ is debounced', while 'j ++' is not
            debouncedBumpI()
            bumpJ()
        }, 100)
        await new Promise<void>(resolve => {
            setTimeout(() => {
                clearInterval(timerId)
                resolve()
            }, 2000)
        })
        expect(10).toBeLessThan(j)
        // tailing, so the execution of i ++ will NOT invoke before the first wait is reached
        expect(i).toBe(0)
        // wait until the debounce waiting finishes and invoke the bumpI
        await new Promise<void>(resolve => {
            setTimeout(() => resolve(), 1000)
        })
        expect(i).toBe(1)

    })
})
