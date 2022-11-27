import React, { useEffect } from 'react';
import useOrderFlow from './hooks/useOrderFlow'
import SearchBox from './components/SearchBox';
import OrderList from './components/OrderList';
import './App.scss';

function App() {
    const { connectOrderFlowSocket } = useOrderFlow()
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
