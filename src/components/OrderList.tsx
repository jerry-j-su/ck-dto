import React, { useState, useEffect, useMemo } from 'react'

import { OrderType } from '../types'
import { ScrollableContainerExtraProps } from './dynamicScrollableListHOC'
import OrderSkeleton from './OrderSkeleton'
import './OrderList.scss'

type OrderListProps = {
    orders: OrderType[],
    containerClassName?: string,
}
const UpdateBatchSize = 100  // how many buffered records to attach to DOM tree if user scroll down to the bottom of the page

export default React.forwardRef(({ orders, containerClassName, holdAppendChild }: OrderListProps & ScrollableContainerExtraProps, ref: any) => {

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
        <section className={['order-list-container', containerClassName || ''].join(' ')} ref={ref}>
            <ul className="order-list-body">
                {ordersToShow.map(({ id, customer, destination, 'event_name': status, item, price, 'sent_at_second': time }) => (
                    <li className="order-wrapper" key={`${id}-${status}`}>
                        <dl>
                            <div className="top-row">
                                <dt className="label name">name</dt>
                                <dd className="value name">{customer}</dd>
                            </div>
                            <div className="name-spacer" />
                            <div className="col-1">
                                <dt className="label status" style={{ display: 'none' }}>Status</dt>
                                <dd className="value status">{status}</dd>
                            </div>
                            <div className="status-spacer" />
                            <div className="col-2">
                                <dt className="label items">items</dt>
                                <dd className="value items">{item}</dd>
                                <div className="spacer" />
                                <dt className="label price">price</dt>
                                <dd className="value price">{price}</dd>
                            </div>
                        </dl>
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
