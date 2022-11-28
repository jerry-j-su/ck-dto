import React, { useState, useEffect } from 'react'

import useOrders from '../state/useOrders'
import './OrderList.scss'

export default function OrderList () {
    const { orderList, filteredOrderList, orderCount } = useOrders()

    const [ordersToShow, setOrderToShow] = useState(orderList)
    useEffect(() => {
        if (filteredOrderList) setOrderToShow(filteredOrderList)
        else setOrderToShow(orderList)
    }, [filteredOrderList, orderList, setOrderToShow])

    return (
        <section className="order-list-container">
            <dl>
                <dl>Count: {orderCount}</dl>
                <dl>Filter Count: {filteredOrderList && filteredOrderList.length}</dl>
            </dl>
            <ul className="order-list-body">
                {ordersToShow && ordersToShow.map(({ id, customer, destination, 'event_name': status, item, price, 'sent_at_second': time }) => (
                    <li className="order-wrapper" key={`${id}-${status}`}>
                        <dl>
                            <div className="top-row">
                                <dt className="label name">name</dt>
                                <dd className="value name">{customer}</dd>
                            </div>
                            <div className="name-spacer" />
                            <div className="col-1">
                                <dt className="label status" style={{display: 'none'}}>Status</dt>
                                <dd className="value status">{status}</dd>
                            </div>
                            <div className="status-spacer" />
                            <div className="col-2">
                                <dt className="label items">items</dt>
                                <dd className="value items">{item}</dd>
                                <div className="spacer"/>
                                <dt className="label price">price</dt>
                                <dd className="value price">{price}</dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ul>
        </section>
    )
}
