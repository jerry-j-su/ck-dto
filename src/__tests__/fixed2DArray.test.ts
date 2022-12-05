import fixed2DArray, { IFixed2DArray } from '../utils/fixed2DArray'

describe('fixed2DArray tests', () => {
    let test2DArray: IFixed2DArray<number>
    const testBlockSize = 10
    beforeEach(() => {
        test2DArray = fixed2DArray({ blockSize: testBlockSize })
    })

    test('Can store items with given block size, and can store and index items beyond one block and onwards', () => {
        for (let i = 0; i < testBlockSize + 5; i++) {
            const testValue = 100 + i
            test2DArray.add(100 + i)
            expect(test2DArray.get(i)).toBe(testValue)
        }
        expect(test2DArray.length).toBe(testBlockSize + 5)
    })

    test('Can modified item at given index', () => {
        const modifiedValue = 1000
        const testIndex = 10
        for (let i = 0; i < testBlockSize + 5; i++) {
            const testValue = 100 + i
            test2DArray.add(100 + i)
            expect(test2DArray.get(i)).toBe(testValue)
            expect(test2DArray.get(i)).not.toBe(modifiedValue)
        }

        test2DArray.set(testIndex, modifiedValue)
        expect(test2DArray.get(testIndex)).toBe(modifiedValue)
    })

    test('Can return a sliced array containing items specified by start and end index', () => {
        const startIndex = 4
        const endIndex = 12
        const base = 25
        const testSize = 2 * testBlockSize + 5
        const expectedResult = []
        const expectedResult2 = []
        for (let i = 0; i < testSize; i++) {
            test2DArray.add(base + i)
        }
        for (let j = startIndex; j < endIndex; j++) {
            expectedResult.push(base + j)
        }

        for (let j = startIndex; j < testSize; j++) {
            expectedResult2.push(base + j)
        }

        expect(test2DArray.slice(startIndex, endIndex)).toEqual(expectedResult)
        expect(test2DArray.slice(startIndex)).toEqual(expectedResult2)
    })

    test("2D Array slice method's start index and end index can be negative number, with same usage of Array.prototype.slice", () => {
        const startIndex = -21
        const endIndex = -2
        const base = 25
        const testSize = 2 * testBlockSize + 5
        const expectedResult = []
        for (let i = 0; i < testSize; i++) {
            test2DArray.add(base + i)
        }
        for (let j = (startIndex + testSize); j < (endIndex + testSize); j++) {
            expectedResult.push(base + j)
        }

        expect(test2DArray.slice(startIndex, endIndex)).toEqual(expectedResult)
    })

    test('Can convert to flattened primitive array containing all elements by the timely order', () => {
        const base = 25
        const expectedResult = []
        const testSize = 2 * testBlockSize + 5
        for (let i = 0; i < testSize; i++) {
            test2DArray.add(base + i)
        }
        for (let j = 0; j < testSize; j++) {
            expectedResult.push(base + j)
        }

        expect(test2DArray.toArray()).toEqual(expectedResult)
    })
})
