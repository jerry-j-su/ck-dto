/**
 * Enables specific scroll behavior for given container DOM
 */
import React, { useEffect, useRef } from 'react'

import { mergeClassNames, observeDOM, tailingDebounce } from '../utils/misc'

enum ScrollType {
    auto = 'auto',
    hidden = 'hidden',
    visible = 'visible',
}
export type ScrollableOptions = {
    x?: ScrollType,
    y?: ScrollType,
    interval?: number,
    style?: {
        container?: string,
        trigger?: {
            top?: string,
            bottom?: string,
            left?: string,
            right?: string,
        }
    }
}
export type useScrollableReturns = {
    triggerClassNames: { top: string, bottom: string, left: string, right: string }
}

const DEFAULT_STYLE = {
    container: 'scrollable-container',
    trigger: {
        top: 'scrollable-top',
        bottom: 'scrollable-bottom',
        left: 'scrollable-left',
        right: 'scrollable-right',
    },
}
const DEFAULT_OPTIONS: ScrollableOptions = {
    x: ScrollType.auto,
    y: ScrollType.auto,
    interval: 50,
    style: DEFAULT_STYLE,
}
Object.freeze(DEFAULT_OPTIONS)

const onScroll = tailingDebounce((event: Event) => {
    const { currentTarget } = event

    console.log(event);
}, 200)

export default function scrollableHOC(Container: any, givenOptions?: ScrollableOptions) {


    const options = {
        ...givenOptions,
        style: {
            container: mergeClassNames([givenOptions?.style?.container, DEFAULT_STYLE.container]),
            trigger: {
                top: mergeClassNames([givenOptions?.style?.trigger?.top, DEFAULT_STYLE.trigger.top]),
                bottom: mergeClassNames([givenOptions?.style?.trigger?.bottom, DEFAULT_STYLE.trigger.bottom]),
                left: mergeClassNames([givenOptions?.style?.trigger?.left, DEFAULT_STYLE.trigger.left]),
                right: mergeClassNames([givenOptions?.style?.trigger?.right, DEFAULT_STYLE.trigger.right]),
            },
        }
    }

    // const childrenWithProps = React.Children.map(children, child => {
    //     if (React.isValidElement(child)) {
    //         return React.cloneElement(child);
    //     }
    //     return child;
    // });

    // Scrollable Container Component
    return (props: React.PropsWithoutRef<any>) => {
        const containerRef = useRef<HTMLElement>(null)
        const containerDOM = containerRef?.current

        useEffect(() => {
            if (containerDOM instanceof HTMLElement) {
                containerDOM.addEventListener('scroll', onScroll)
                observeDOM(containerDOM, tailingDebounce(() => {
                    console.log('contain added')
                }, 200))
            }
            return () => {
                containerDOM?.removeEventListener('scroll', onScroll)
            }
        }, [containerDOM])

        return <Container {...props} ref={containerRef} />
    }
}
