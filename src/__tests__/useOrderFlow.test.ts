import { readFileSync } from 'fs'

import { orderFlowSocket, OrderEvent } from '../service'
import useOrderFlow, { filterOrderListBy } from '../hooks/useOrderFlow'

const sideEffectList: Function[] = []
// module mocks
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        useRef: () => ({ current: { value: 'random content' } }),
        useState: (initialValue: any) => [initialValue, () => {}],
        useCallback: (cb: Function) => cb,
        useEffect: (cb: Function) => sideEffectList.push(cb),
    }
})
jest.mock('react-use', () => {
    const originalModule = jest.requireActual('react-use')
    return {
        __esModule: true,
        ...originalModule,
        createGlobalState: (initialize: Function) => () => [initialize(), () => {}],
    }
})
// data mocks
const mockOrders = JSON.parse(readFileSync(`${__dirname}/dummyOrders.json`, { encoding: 'utf-8' }))

describe('Test for useOderFlow.ts', () => {
    const { orderMap, orderList, connectOrderFlowSocket, setFilteredOrderList } = useOrderFlow();
    // beforeEach(() => {
    //     jest.spyOn(useOrderFlow, 'orderFlowSocket').mockImplementation()
    // })

    test('new order can be registered, same order can be updated', () => {

        // @ts-ignore
        jest.spyOn(orderFlowSocket, 'on').mockImplementation((event: string, callback: any) => {
            callback(mockOrders)
        })
        expect(orderMap.size).toBe(0)
        connectOrderFlowSocket()
        expect(orderMap.size).toBe(mockOrders.length - 1) // there is one update order in the dummy data
        expect(orderList[0]).toEqual(mockOrders[1])
    })

    test('orders can be filtered by price', () => {
        const expectedEntry = mockOrders[2]
        const filteredList = filterOrderListBy(orderList, { price: expectedEntry.price })
        expect(filteredList?.length).toBe(1)
        expect(filteredList && filteredList[0]).toEqual(expectedEntry)
    })

    test('empty or invalid filter criteria removes the filtered order list', () => {
        let filteredList = filterOrderListBy(orderList, {})
        expect(filteredList).toBe(undefined)
    })
})
