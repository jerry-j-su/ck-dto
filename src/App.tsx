import React, { useEffect } from 'react';

import useOrders from './state/useOrders'
import SearchBox from './components/SearchBox';
import OrderList from './components/OrderList';
import scrollableHOC from './components/scrollableHOC';
import './App.scss';

const ScrollableOrderList = scrollableHOC(OrderList)

function App() {
    const { orderList, filteredOrderList, orderCount, connectOrderFlowSocket } = useOrders()
    useEffect(() => connectOrderFlowSocket(), [connectOrderFlowSocket])

    return (
        <div className="App">
            <header className="App-header"></header>
            <main className="App-main">
                <SearchBox />
                <span className="order-count">
                    {filteredOrderList
                        ? `Showing ${filteredOrderList && filteredOrderList.length} of ${orderCount} orders`
                        : `Total ${orderCount} orders`
                    }
                </span>
                <ScrollableOrderList orders={orderList} containerClassName={filteredOrderList ? 'hidden' : ''} />
                {filteredOrderList && <OrderList orders={filteredOrderList} containerClassName={filteredOrderList ? '' : 'hidden'} />}
            </main>
        </div>
    );
}

export default App;
