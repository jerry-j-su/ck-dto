import React from 'react'

import { OrderType } from '../types'
import './OrderList.scss'

type OrderListProps = {
    orders?: OrderType[],
    containerClassName?: string,
}

export default React.forwardRef(({ orders, containerClassName }: OrderListProps, ref: any) => {
    if (!Array.isArray(orders)) return null

    return (
        <section className={['order-list-container', containerClassName || ''].join(' ')} ref={ref}>
            <ul className="order-list-body">
                {orders.map(({ id, customer, destination, 'event_name': status, item, price, 'sent_at_second': time }) => (
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
            </ul>
        </section>
    )
})
