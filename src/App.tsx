import React, { useEffect } from 'react';

import useOrders from './state/useOrders'
import SearchBox from './components/SearchBox';
import OrderList from './components/OrderList';
import dynamicScrollableListHOC from './components/dynamicScrollableListHOC';
import './App.scss';

const FastRenderOrderList = dynamicScrollableListHOC(OrderList)

function App() {
    const { orderList, filteredOrderList, orderCount, connectOrderFlowSocket } = useOrders()
    useEffect(() => connectOrderFlowSocket(), [connectOrderFlowSocket])

    const showFullList = !filteredOrderList

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
                {/* Full order list, Render is held until user scrolls near bottom for better performance */}
                <FastRenderOrderList
                    orders={orderList}
                    classes={{ wrapper: showFullList ? '' : 'hidden' }}
                />
                {/* Filtered list */}
                {!showFullList && <OrderList orders={filteredOrderList} containerClassName={filteredOrderList ? '' : 'hidden'} />}
            </main>
        </div>
    );
}

export default App;
