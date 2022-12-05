import React from 'react'
import { readFileSync } from 'fs'

import OrderList from '../components/OrderList'


// module mocks
const dummyRenderCount = 1
const mockSetRenderFunc = jest.fn()
const sideEffectList: Function[] = []
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        forwardRef: (cb: Function) => cb,
        useState: (initialValue: any) => [dummyRenderCount, mockSetRenderFunc],  // for the renderCount useState
        useEffect: (cb: Function) => sideEffectList.push(cb),
        useMemo: (cb: Function) => cb(),
    }
})

// dummy data
const mockOrders = JSON.parse(readFileSync(`${__dirname}/dummyOrders.json`, { encoding: 'utf-8' })).slice(1)

describe('<OrderList> Render tests', () => {
    beforeEach(() => {
        mockSetRenderFunc.mockClear()
        sideEffectList.splice(0)    // clear the side effect function list
    })

    test('Basic render', () => {
        const result = OrderList({ orders: mockOrders, containerClassName: 'dummy-container' })
        expect(result).toMatchSnapshot()
    })

    test('holdAppendChild not set, if render account is less than order count, continue adding order record DOM', () => {
        OrderList({ orders: mockOrders, containerClassName: 'dummy-container' })
        expect(mockSetRenderFunc).not.toHaveBeenCalled()
        const sideEffect = sideEffectList.pop()
        if (sideEffect) sideEffect()
        expect(mockSetRenderFunc).toHaveBeenCalled()
    })

    test('holdAppendChild is set, order record rendering is on hold, render count stay the same', () => {
        OrderList({ orders: mockOrders, containerClassName: 'dummy-container', holdAppendChild: true })
        expect(mockSetRenderFunc).not.toHaveBeenCalled()
        const sideEffect = sideEffectList.pop()
        if (sideEffect) sideEffect()
        expect(mockSetRenderFunc).not.toHaveBeenCalled()
    })
})
