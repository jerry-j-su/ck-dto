import React from 'react'

import OrderList from '../components/OrderList'
import useOrderFlow from '../hooks/useOrderFlow'

// module mocks
const mockSetStateFunc = jest.fn()
const sideEffectList: Function[] = []
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        useState: (initialValue: any) => [initialValue, mockSetStateFunc],
        useEffect: (cb: Function) => sideEffectList.push(cb),
    }
})
const mockOrderList = [1]
const mockFilteredOrderList = [2, 4]
jest.mock('../hooks/useOrderFlow', () => ({
    __esModule: true,
    default: () => ({
        orderList: mockOrderList,
        filteredOrderList: mockFilteredOrderList,
    })
}))

test('display full list when no filter', () => {
    OrderList()
    const sideEffect = sideEffectList.pop()
    if (sideEffect) sideEffect()
    expect(mockSetStateFunc.mock.calls[mockSetStateFunc.mock.calls.length - 1][0]).toBe(mockFilteredOrderList)
})
