import React, { useState, useEffect, useMemo, forwardRef } from 'react'

import { OrderType } from '../types'
import { ScrollableContainerExtraProps } from './dynamicScrollableListHOC'
import OrderSkeleton from './OrderSkeleton'
import { mergeClassNames } from '../utils'
import './OrderList.scss'

type OrderListProps = {
    orders: OrderType[],
    containerClassName?: string,
}
const UpdateBatchSize = 10  // how many buffered records to attach to DOM tree if user scroll down to the bottom of the page

export default forwardRef(({ orders, containerClassName, holdAppendChild }: OrderListProps & ScrollableContainerExtraProps, ref: any) => {
    const [renderCount, setRenderCount] = useState<number>(0)
    useEffect(() => {
        if (holdAppendChild) return
        if (renderCount < orders.length) {
            setRenderCount(renderCount + UpdateBatchSize)
        }
    }, [holdAppendChild, orders, orders.length, renderCount, setRenderCount])

    const ordersToShow = useMemo(() => {
        return orders.slice(0, renderCount)
    }, [orders, orders.length, renderCount]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <section className={mergeClassNames(['order-list-container', containerClassName])} ref={ref} tabIndex={0}>
            <ul className="order-list-body">
                {ordersToShow.map(({ id, customer, destination, 'event_name': status, item, price, 'sent_at_second': time }) => (
                    <li className="order-wrapper" key={`${id}-${status}`}>
                            <div className="top-row">
                                <span className="label name">name</span>
                                <span className="value name">{customer}</span>
                            </div>
                            <div className="name-spacer" />
                            <div className="col-1">
                                <span className="label status" style={{ display: 'none' }}>Status</span>
                                <span className="value status">{status}</span>
                            </div>
                            <div className="status-spacer" />
                            <div className="col-2">
                                <span className="label items">items</span>
                                <span className="value items">{item}</span>
                                <div className="spacer" />
                                <span className="label price">price</span>
                                <span className="value price">{price}</span>
                            </div>
                    </li>
                ))}
                {/* DOM append is held due, display skeleton */}
                {holdAppendChild && renderCount < orders.length
                    ? (<>
                        <li className="order-wrapper skeleton"><OrderSkeleton /></li>
                        <li className="order-wrapper skeleton"><OrderSkeleton /></li>
                      </>)
                    : <li className="order-wrapper end"><div className="loading-dot" /></li>
                }
            </ul>
        </section>
    )
})
