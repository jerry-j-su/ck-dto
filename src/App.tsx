import React, { useEffect } from 'react';

import useOrders from './state/useOrders'
import SearchBox from './components/SearchBox';
import OrderList from './components/OrderList';
import './App.scss';

function App() {
    const { connectOrderFlowSocket } = useOrders()
    useEffect(() => connectOrderFlowSocket(), [connectOrderFlowSocket])

    return (
        <div className="App">
            <header className="App-header"></header>
            <main className="App-main">
                <SearchBox />
                <OrderList />
            </main>
        </div>
    );
}

export default App;
