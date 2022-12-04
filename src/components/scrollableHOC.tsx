/**
 * Enables specific scroll behavior for given container component
 */
import React, { useEffect, useRef, useState, useCallback } from 'react'

import { mergeClassNames, observeDOM, throttle } from '../utils/misc'

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
        wrapper?: string,
        tips?: {
            top?: string,
            bottom?: string,
        }
    }
}
enum ToBottom { InRange, Near, Far }
export type ViewPosition = {
    atTop: boolean,
    toBottom: ToBottom,
}

export type ScrollableContainerExtraProps = {
    holdAppendChild?: boolean
}

const DEFAULT_STYLE = {
    wrapper: 'scrollable-wrapper',
    tips: {
        top: 'scrollable-tip-top',
        bottom: 'scrollable-tip-bottom',
    },
}
const DEFAULT_OPTIONS: ScrollableOptions = {
    x: ScrollType.auto,
    y: ScrollType.auto,
    interval: 50,
    style: DEFAULT_STYLE,
}
Object.freeze(DEFAULT_OPTIONS)
const DEFAULT_VIEW_POSITION = { atTop: true, toBottom: ToBottom.InRange }

function calculateViewPosition (containerDOM: HTMLElement, contentDOM: HTMLElement): ViewPosition {
    if (!(containerDOM instanceof HTMLElement) || !(contentDOM instanceof HTMLElement)) return DEFAULT_VIEW_POSITION

    // console.log('calculating view position')
    const { scrollTop } = containerDOM
    const { height: containerH } = containerDOM.getBoundingClientRect()
    const { height: contentH } = contentDOM.getBoundingClientRect()
    // make sure the contain has no padding nor margin
    const remainingH = Math.max(Math.floor(contentH - (scrollTop + containerH)), 0)
    const atTop = scrollTop <= 100

    if (remainingH <= 0) return { atTop, toBottom: ToBottom.InRange }
    if (remainingH <= 2 * containerH) return { atTop, toBottom: ToBottom.Near }
    return { atTop, toBottom: ToBottom.Far }
}
const debouncedCalculateViewPosition = throttle<ViewPosition>(calculateViewPosition, 100)

export default function scrollableHOC(Container: any, givenOptions?: ScrollableOptions) {
    const options = {
        ...givenOptions,
        style: {
            wrapper: mergeClassNames([givenOptions?.style?.wrapper, DEFAULT_STYLE.wrapper]),
            tips: {
                top: mergeClassNames([givenOptions?.style?.tips?.top, DEFAULT_STYLE.tips.top]),
                bottom: mergeClassNames([givenOptions?.style?.tips?.bottom, DEFAULT_STYLE.tips.bottom]),
            },
        }
    }

    return (props: React.PropsWithoutRef<any>) => {
        const containerRef = useRef<HTMLElement>(null)
        const containerDOM = containerRef?.current
        const contentDOM = containerDOM?.children[0] as HTMLElement

        const [viewPosition, setViewPosition] = useState<ViewPosition>(DEFAULT_VIEW_POSITION)

        /**
         * Handler upon scroll, debounce
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const onScroll = useCallback(() => {
            setViewPosition(debouncedCalculateViewPosition(containerDOM, contentDOM) || DEFAULT_VIEW_POSITION)
        }, [setViewPosition, containerDOM, contentDOM])

        useEffect(() => {
            if (containerDOM instanceof HTMLElement) {
                containerDOM.addEventListener('scroll', onScroll)
                observeDOM(containerDOM, onScroll)
            }
            return () => {
                containerDOM?.removeEventListener('scroll', onScroll)
            }
        }, [containerDOM, contentDOM, onScroll])

        return (
            <div className={options.style.wrapper}>
                {!viewPosition.atTop && <div className={options.style.tips.top}>newer orders</div>}
                <Container {...props} ref={containerRef} holdAppendChild={viewPosition.toBottom === ToBottom.Far} />
                {viewPosition.toBottom !== ToBottom.InRange && <div className={options.style.tips.bottom}>more older orders</div>}
            </div>
        )

        // const childrenWithProps = React.Children.map(children, child => {
        //     if (React.isValidElement(child)) {
        //         return React.cloneElement(child);
        //     }
        //     return child;
        // });

        // Scrollable Container Component
    }
}
