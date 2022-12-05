import React from 'react'
import { render } from '@testing-library/react'
import { readFileSync  } from 'fs';

import App from '../App'

// module mocks
const sideEffectList: Function[] = []
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        useRef: () => ({ current: { value: 'random content' } }),
        useState: (initialValue: any) => [initialValue, () => {}],
        useCallback: () => () => {},
        useEffect: (cb: Function) => sideEffectList.push(cb),
    }
})
const mockConnectOrderFlowSocket = jest.fn()
jest.mock('../state/useOrders', () => ({
    __esModule: true,
    default: () => ({
        connectOrderFlowSocket: mockConnectOrderFlowSocket,
        orderList: mockOrders,
    })
}))
jest.mock('../components/dynamicScrollableListHOC', () => ({
    __esModule: true,
    default: (WrappedComponent: any) => (props: any) => <WrappedComponent {...props} />
}))
// data mocks
const mockOrders = JSON.parse(readFileSync(`${__dirname}/dummyOrders.json`, { encoding: 'utf-8' }))

describe('App.tsx', () => {
    test('App basic render', () => {
        const nodes = render(App())
        expect(nodes.container).toMatchSnapshot()
    })

    test('Connect order flow socket upon App starts', () => {
        // @ts-ignore
        expect(mockConnectOrderFlowSocket.mock.calls.length).toBe(0)
        if (sideEffectList[0]) sideEffectList[0]()
        // @ts-ignore
        expect(mockConnectOrderFlowSocket.mock.calls.length).toBe(1)

    })
})
