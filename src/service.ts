/**
 * Socket service layer
 */
 import io from 'socket.io-client'

const SocketURL = 'http://localhost:4000'
const ClientSocketConfig = {
    // secure: true,
    // path: '/'
}

export const OrderEvent = {
    Connect: 'connect_order_flow',
    NewOrder: 'order_event',
}

// Socket Service singleton
export const orderFlowSocket = io(SocketURL, ClientSocketConfig)
