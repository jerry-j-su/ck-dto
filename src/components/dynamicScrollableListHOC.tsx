/**
 * Dynamic Scrollable list for long list:
 * - Increased Render Performance:
 *   DOM nodes count is limited on certain scroll range. Wrapped Component's DOM creation will be held upon scrolling to certain position
 * - Enables specific scroll handle/behavior for the Wrapped Component DOM
 * - handler is debounced/throttled
 */
import React, { useEffect, useRef, useState, useCallback } from 'react'

import { mergeClassNames, observeDOM, throttle } from '../utils/misc'

export type ScrollableOptions = {
    interval?: number,
}
enum ToBottom { InRange, Near, Far }
export type ViewPosition = {
    atTop: boolean,
    toBottom: ToBottom,
}

// property to pass to its wrapped component, telling it to hold/continue render new content DOM nodes
export type ScrollableContainerExtraProps = {
    holdAppendChild?: boolean
}

/* Default settings */
const DEFAULT_STYLE = {
    wrapper: 'scrollable-wrapper',
    tips: {
        top: 'scrollable-tip-top',
        bottom: 'scrollable-tip-bottom',
    },
}
const DEFAULT_OPTIONS: ScrollableOptions = {
    interval: 50,
}
const DEFAULT_VIEW_POSITION = { atTop: true, toBottom: ToBottom.InRange }
Object.freeze(DEFAULT_STYLE)
Object.freeze(DEFAULT_OPTIONS)
Object.freeze(DEFAULT_VIEW_POSITION)

/**
 * Calculate the position of the viewable part relative to the entire long content DOM
 * @param {HTMLElement} containerDOM - the limited size viewport container that scrolls
 * @param {HTMLElement} contentDOM - the long DOM that holds large amount of content
 * @returns
 */
function calculateViewPosition (containerDOM: HTMLElement, contentDOM: HTMLElement): ViewPosition {
    if (!(containerDOM instanceof HTMLElement) || !(contentDOM instanceof HTMLElement)) return DEFAULT_VIEW_POSITION

    // console.log('calculating view position')
    const { scrollTop } = containerDOM
    const { height: containerH } = containerDOM.getBoundingClientRect()
    const { height: contentH } = contentDOM.getBoundingClientRect()
    // make sure the contain has no padding nor margin
    const remainingH = Math.max(Math.floor(contentH - (scrollTop + containerH)), 0)
    const atTop = scrollTop <= 150

    if (remainingH <= 159) {
        // console.log(`at top: ${atTop}, ToBottom: in range`)
        return { atTop, toBottom: ToBottom.InRange }
    }
    if (remainingH <= 2 * containerH) {
        // console.log(`at top: ${atTop}, ToBottom: near`)
        return { atTop, toBottom: ToBottom.Near }
    }
    // console.log(`at top: ${atTop}, ToBottom: far`)
    return { atTop, toBottom: ToBottom.Far }
}


export type DynamicScrollableListWrapperProps = React.PropsWithoutRef<any> & {
    classes?: {
        wrapper?: string,
        tips?: {
            top?: string,
            bottom?: string,
        }
    },
}
/**
 * Dynamic Scrollable list for long list
 * @param {React.FC} Container - Wrapped Container Component which contains a possibly long-list node
 * @param {ScrollableOptions} [options]
 * @returns
 */
export default function dynamicScrollableListHOC(Container: any, options?: ScrollableOptions) {
    // construct a throttled version of the cost-heavy view calculate method
    const interval = (options?.interval || DEFAULT_OPTIONS.interval) as number
    const throttledCalculateViewPosition = throttle<ViewPosition>(calculateViewPosition, interval)

    return (props: DynamicScrollableListWrapperProps) => {
        const containerRef = useRef<HTMLElement>(null)
        const containerDOM = containerRef?.current
        const contentDOM = containerDOM?.children[0] as HTMLElement

        const [viewPosition, setViewPosition] = useState<ViewPosition>(DEFAULT_VIEW_POSITION)

        const {
            classes: { wrapper, tips } = {},
            ...passThroughProps
        } = props

        const wrapperClass = mergeClassNames([wrapper, DEFAULT_STYLE.wrapper])
        const topTipClass = mergeClassNames([tips?.top, DEFAULT_STYLE.tips.top])
        const bottomTipClass = mergeClassNames([tips?.bottom, DEFAULT_STYLE.tips.bottom])

        /**
         * Handler upon scroll or list modification, throttled
         * Calculate the position of the viewable part relative to the entire long content DOM
         * Result will be passed to its wrapped component to let it hold/continue adding more content nodes
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const onScrollOrContentChange = useCallback(() => {
            setViewPosition(throttledCalculateViewPosition(containerDOM, contentDOM) || DEFAULT_VIEW_POSITION)
        }, [setViewPosition, containerDOM, contentDOM])

        useEffect(() => {
            let observer: MutationObserver | undefined
            if (containerDOM instanceof HTMLElement) {
                containerDOM.addEventListener('scroll', onScrollOrContentChange)
                observer = observeDOM(containerDOM, onScrollOrContentChange)
            }
            return () => {
                containerDOM?.removeEventListener('scroll', onScrollOrContentChange)
                observer?.disconnect && observer.disconnect()
            }
        }, [containerDOM, contentDOM, onScrollOrContentChange])

        return (
            <div className={wrapperClass} >
                {!viewPosition.atTop && <div className={topTipClass}>
                    <i className="arrow-up">&gt;</i>
                    <br />
                    Latest orders
                </div>}
                <Container {...passThroughProps} ref={containerRef} holdAppendChild={viewPosition.toBottom === ToBottom.Far} />
                {viewPosition.toBottom !== ToBottom.InRange && <div className={bottomTipClass}>
                    More orders
                    <br />
                    <i className="arrow-down">&lt;</i>
                </div>}
            </div>
        )
    }
}
