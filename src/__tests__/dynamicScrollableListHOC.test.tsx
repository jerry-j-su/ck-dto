import React, { Children } from 'react'
import { render } from '@testing-library/react'
import { readFileSync } from 'fs';

import dynamicScrollableListHOC, { ToBottom, calculateViewPosition } from '../components/dynamicScrollableListHOC'

// module mocks
const sideEffectList: Function[] = []
const mockAddEventListener = jest.fn()
jest.mock('react', () => {
    const originalModule = jest.requireActual('react')
    return {
        __esModule: true,
        ...originalModule,
        useRef: () => ({
            current: {
                addEventListener: mockAddEventListener,
                children: [
                    {
                        getBoundingClientRect: () => ({ height: 4098 }),
                    }
                ]
            }
        }),
        useState: (initialValue: any) => [initialValue, () => { }],
        useCallback: () => () => { },
        useEffect: (cb: Function) => sideEffectList.push(cb),
    }
})
jest.mock('../utils/misc', () => ({
    __esModule: true,
    ...jest.requireActual('../utils/misc'),
    observeDOM: jest.fn()
}))
import { observeDOM as mockObserveDOM } from '../utils/misc'

const DummyComponent = () => (<div></div>)
const contentDOM = document.createElement('div')
const containerDOM = document.createElement('div')

describe('dynamicScrollableListHOC test', () => {
    beforeEach(() => {
        sideEffectList.splice(0) // clear side effect before each case
    })

    test('Basic wrapper render', () => {
        const nodeTree = dynamicScrollableListHOC(DummyComponent)({})
        expect(nodeTree).toMatchSnapshot();
    })

    test('Should begin monitoring content DOM mutation and scroll', () => {
        dynamicScrollableListHOC(DummyComponent)({})
        mockAddEventListener.mockClear()
        // @ts-ignore
        mockObserveDOM.mockClear()
        const sideEffect = sideEffectList.pop()
        if (sideEffect) sideEffect()
        expect(mockAddEventListener).toHaveBeenCalled()
        expect(mockObserveDOM).toHaveBeenCalled()

    })

    test('calculateViewPosition should detect when content bottom is in view area', () => {
        const contentDOMProxy = new Proxy(contentDOM, {
            get(target, prop, receiver) {
                if (prop === 'getBoundingClientRect') {
                    return () => ({ height: 900 })
                }
                // @ts-ignore
                return Reflect.get(...arguments);
            },
        });
        const containerDOMProxy = new Proxy(containerDOM, {
            get(target, prop, receiver) {
                switch (prop) {
                    case 'scrollTop':
                        return 0
                    case 'getBoundingClientRect':
                        return () => ({ height: 960 })
                    default:
                        // @ts-ignore
                        return Reflect.get(...arguments);
                }

            },
        });
        const viewPosition = calculateViewPosition(containerDOMProxy, contentDOMProxy)
        expect(viewPosition).toEqual({ atTop: true, toBottom: ToBottom.InRange })
    })

    test('calculateViewPosition should detect when view area is near content bottom', () => {
        const contentDOMProxy = new Proxy(contentDOM, {
            get(target, prop, receiver) {
                if (prop === 'getBoundingClientRect') {
                    return () => ({ height: 1440 })
                }
                // @ts-ignore
                return Reflect.get(...arguments);
            },
        });
        const containerDOMProxy = new Proxy(containerDOM, {
            get(target, prop, receiver) {
                switch (prop) {
                    case 'scrollTop':
                        return 200
                    case 'getBoundingClientRect':
                        return () => ({ height: 960 })
                    default:
                        // @ts-ignore
                        return Reflect.get(...arguments);
                }

            },
        });
        const viewPosition = calculateViewPosition(containerDOMProxy, contentDOMProxy)
        expect(viewPosition).toEqual({ atTop: false, toBottom: ToBottom.Near })
    })

    test('calculateViewPosition should detect when view area is far away from content bottom', () => {
        const contentDOMProxy = new Proxy(contentDOM, {
            get(target, prop, receiver) {
                if (prop === 'getBoundingClientRect') {
                    return () => ({ height: 4096 })
                }
                // @ts-ignore
                return Reflect.get(...arguments);
            },
        });
        const containerDOMProxy = new Proxy(containerDOM, {
            get(target, prop, receiver) {
                switch (prop) {
                    case 'scrollTop':
                        return 200
                    case 'getBoundingClientRect':
                        return () => ({ height: 960 })
                    default:
                        // @ts-ignore
                        return Reflect.get(...arguments);
                }

            },
        });
        const viewPosition = calculateViewPosition(containerDOMProxy, contentDOMProxy)
        expect(viewPosition).toEqual({ atTop: false, toBottom: ToBottom.Far })
    })
})
