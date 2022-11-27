import React from 'react'
import { render } from '@testing-library/react'
import { readFileSync  } from 'fs';

import SearchBox, { InputBox } from '../components/SearchBox'
import OrderList from '../components/OrderList'


// module mocks
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')

    //Mock the default export and named export 'foo'
    return {
        __esModule: true,
        ...originalModule,
        //   default: jest.fn(() => 'mocked baz'),
        useRef: () => ({ current: { value: 'random content' } }),
        useState: (initialValue: any) => [initialValue, () => {}],
        useCallback: () => () => {},
        useEffect: () => {},
    }
})
jest.mock('../hooks/useOrderFlow', () => ({
    __esModule: true,
    default: () => ({
        orderList: mockOrders,
        setFilterCriteria: () => { console.log('set filter criteria ')},
    })
}))
// data mocks
const mockOrders = JSON.parse(readFileSync(`${__dirname}/dummyOrders.json`, { encoding: 'utf-8' }))

describe('High-level Component render before actual DOM', () => {

    test('SearchBox Input box basic render', () => {
        const onInput = jest.fn()
        const clearInput = jest.fn()
        const nodes = render(InputBox({ value: '3', onInput, clearInput }))
        expect(nodes.container).toMatchSnapshot()
    })

    test('SearchBox basic render', () => {
        const nodes = render(SearchBox())
        expect(nodes.container).toMatchSnapshot()
    })

    test('Order List basic render', () => {
        const nodeTree = render(OrderList())
        expect(nodeTree.container).toMatchSnapshot()
    })
})
