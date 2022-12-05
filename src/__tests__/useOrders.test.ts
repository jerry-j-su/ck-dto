// @ts-nocheck
import { readFileSync } from 'fs'

import { orderFlowSocket } from '../service'
import useOrders, { filterOrderListByPrice } from '../state/useOrders'

const sideEffectList: Function[] = []
const sideLayoutEffectList: Function[] = []
// module mocks
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        useRef: () => ({ current: { value: 'random content' } }),
        useState: (initialValue: any) => [initialValue, () => { }],
        useCallback: (cb: Function) => cb,
        useEffect: (cb: Function) => sideEffectList.push(cb),
        useLayoutEffect: (cb: Function) => sideLayoutEffectList.push(cb),
    }
})

jest.mock('../utils/fixed2DArray', () => {
    return {
        __esModule: true,
        default: (() => {
            const mock2DArrayGet = jest.fn()
            const mock2DArrayAdd = jest.fn()
            const mock2DArraySet = jest.fn()
            return () => ({
                get: mock2DArrayGet,
                length: 10,
                add: mock2DArrayAdd,
                set: mock2DArraySet,
                toArray: () => [],
                slice: () => [],
            })
        })()
    }
})
import fixed2DArray from '../utils/fixed2DArray'
const { get: mock2DArrayGet, add: mock2DArrayAdd, set: mock2DArraySet } = fixed2DArray()
// data mocks
const id1 = '0000001'
const id2 = '0000002'
const id3 = '0000003'
const mockOrders = [
    {
        "customer": "Derek Marshall",
        "destination": "43064 Kent Lodge, South Ashley, CA 95282",
        "event_name": "DRIVER_RECEIVED",
        "id": id1,
        "item": "Orange chicken",
        "price": 4775,
    },
    {
        "customer": "Derek Marshall",
        "destination": "43064 Kent Lodge, South Ashley, CA 95282",
        "event_name": "DELIVERED",
        "id": id1,
        "item": "Orange chicken",
        "price": 4775,
    },
    {
        "customer": "Kevin Thornton",
        "destination": "512 Zachary Unions, Brandonstad, CA 90538",
        "event_name": "CREATED",
        "id": id2,
        "item": "Impossible beef burger",
        "price": 7257,
    },
    {
        "customer": "Julia Wilson",
        "destination": "16 Mac Lucia, St Houslet, CA 92362",
        "event_name": "CREATED",
        "id": id3,
        "item": "Apple pie",
        "price": 4775,
    },
]

describe('Test for useOderFlow.ts', () => {
    beforeAll(() => {
        mock2DArrayAdd.mockClear()
        mock2DArraySet.mockClear()
        mock2DArrayGet.mockClear()
    })
    const { orderList, connectOrderFlowSocket } = useOrders();

    // TODO fix these 2 tests
    test('new order can be registered, same order can be updated', () => {
        jest.spyOn(orderFlowSocket, 'on').mockImplementation((event: string, callback: any) => {
            callback(mockOrders)
        })
        connectOrderFlowSocket()
        expect(mock2DArrayAdd.mock.calls.length).toBe(3) // there is one update order in the dummy data
        expect(mock2DArraySet.mock.calls.length).toBe(1)
    })

    test('orders can be filtered by price', () => {
        mock2DArrayGet.mockImplementation(() => 123)
        const expectedIndex = 0
        const expectedEntry = mockOrders[0]
        const filterList = filterOrderListByPrice(expectedEntry.price)
        expect(mock2DArrayGet).toHaveBeenCalled()
        // only 1 entry suits the filter criteria in the dummy data
        expect(filterList.length).toBe(2)
    })

    test('empty or invalid filter criteria removes the filtered order list', () => {
        let filteredList = filterOrderListByPrice()
        expect(filteredList).toBe(undefined)
    })
})
