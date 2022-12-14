import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { readFileSync  } from 'fs';

import SearchBox from '../components/SearchBox'

// module mocks
const mockSetStateFunc = jest.fn()
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        useRef: () => ({ current: { value: 'random content' } }),
        useState: (initialValue: any) => [initialValue, mockSetStateFunc],
        useCallback: (cb: Function) => cb,
        useEffect: () => {},
    }
})
const mockSetFilterCriteria = jest.fn()
jest.mock('../state/useOrders', () => ({
    __esModule: true,
    default: () => ({
        orderList: mockOrders,
        setFilterCriteria: mockSetFilterCriteria,
    })
}))
jest.mock('../utils', () => ({
    __esModule: true,
    tailingDebounce: (func: Function) => func,
}))
// data mocks
const mockOrders = JSON.parse(readFileSync(`${__dirname}/dummyOrders.json`, { encoding: 'utf-8' }))

describe('SearchBox logics', () => {
    let searchBoxContainer: HTMLElement
    let inputElement: HTMLInputElement
    beforeEach(() => {
        searchBoxContainer = render(SearchBox())?.container
        inputElement = searchBoxContainer.querySelector('input') as HTMLInputElement
    })

    test('SearchBox can perform a search with input content', async () => {
        const inputValue = '328'
        if (inputElement) {
            fireEvent.input(inputElement, { target: { value: inputValue } })
        }
        expect(mockSetFilterCriteria.mock.calls[0][0]).toEqual({ price: parseInt(inputValue) })
    })

    test('Validate', () => {
        if (inputElement) {
            fireEvent.input(inputElement, { target: { value: '3124abc' } })
        }
        expect(/invalid/i.test(mockSetStateFunc.mock.calls[mockSetStateFunc.mock.calls.length - 1][0])).toBe(true)
    })
})
