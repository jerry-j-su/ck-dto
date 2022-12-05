import reverseIndexMap from '../utils/reverseIndexMap'

describe('reverseIndexMap tests', () => {
    let testMap:any
    beforeEach(() => {
        testMap = reverseIndexMap<string, number>()
    })
    const k1 = 'key1'
    const n1 = 23
    const n12 = 46
    const k2 = 'key2'
    const n2 = 56

    test('can add a new key -> values mapping', () => {
        expect([...testMap.keys()].length).toBe(0)
        const k1 = 'key1'
        const n1 = 23
        const k2 = 'key2'
        const n2 = 56
        testMap.put(k1, n1)
        expect(Array.isArray(testMap.get(k1))).toBe(true)
        expect(testMap.get(k1)).toContain(n1)
        expect((testMap.get(k1) as number[]).length).toBe(1)
        expect([...testMap.keys()].length).toBe(1)
        testMap.put(k2, n2)
        expect(Array.isArray(testMap.get(k2))).toBe(true)
        expect(testMap.get(k2)).toContain(n2)
        expect((testMap.get(k2) as number[]).length).toBe(1)
        expect([...testMap.keys()].length).toBe(2)
    })

    test('can add a value with an existing key to the corresponding bucket', () => {
        testMap.put(k1, n1)
        testMap.put(k1, n12)
        testMap.put(k2, n2)
        expect(testMap.get(k1)).toContain(n12)
        expect((testMap.get(k1) as number[]).length).toBe(2)
        expect([...testMap.keys()].length).toBe(2)
    })

    test('Can clear all data itself', () => {
        testMap.put(k1, n1)
        testMap.put(k1, n12)
        testMap.put(k2, n2)
        expect([...testMap.keys()].length).toBe(2)
        testMap.clear()
        expect([...testMap.keys()].length).toBe(0)
    })
})
