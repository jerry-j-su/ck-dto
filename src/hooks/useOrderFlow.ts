/**
 * Order flow layer
 */
import io from 'socket.io-client'
import { useEffect, useCallback } from 'react'
import { createGlobalState } from 'react-use'
import { simpleUID  } from '../utils'

/**
 * Socket service layer
 * TODO move to an individual file
 */

/* Socket handshake configuration */
const SocketURL = 'http://localhost:4000'
const ClientSocketConfig = {
    // secure: true,
    // path: '/'
}
const OrderEvent = {
    Connect: 'connect_order_flow',
    NewOrder: 'order_event',
}

const socket = io(SocketURL, ClientSocketConfig)

socket.emit(OrderEvent.Connect, {
    socketId: socket.id,
    tokenId: simpleUID(10),
})

// socket.on(OrderEvent.NewOrder, (orderPacket: any) => {
//     console.log('>>> Receive new order')
//     console.log(JSON.stringify(orderPacket, null, 2))
// })

/** end of socket service layer */

/**
 * Globalized order states
 */
const useSocketConnection = createGlobalState<boolean>(() => false)
const useGlobalOrderMap = createGlobalState<Map<string, number>>(() => new Map())
const useGlobalOrderList = createGlobalState<OrderType[]>(() => [])
const useOrderCount = createGlobalState<number>(() => 0)
const useFilterCriteria = createGlobalState<OrderFilterCriteria>(() => ({}))
const useFilteredOrderList = createGlobalState<OrderType[] | undefined>(() => [])
const useLastUpdate = createGlobalState<number>(() => Date.now())

export default function useOrders() {
    const [socketConnected, setConnection] = useSocketConnection()
    const [orderMap, setOrderMap] = useGlobalOrderMap()
    const [orderList, setOrderList] = useGlobalOrderList()
    const [orderCount, setOrderCount] = useOrderCount()
    const [filterCriteria, setFilterCriteria] = useFilterCriteria()
    const [filteredOrderList, setFilteredOrderList] = useFilteredOrderList()

    // last update time stamp, also an indicator to inform re-rendering of underlying components 
    const [lastUpdate, setLastUpdate] = useLastUpdate()
    
    useEffect(() => setOrderCount(orderMap.size), [orderMap, lastUpdate])

    /**
     * Register a new order
     */
    const pushOrder = (orderEntry: OrderType) => {
        const { id, ...rest } = orderEntry
        orderList.push({ id, ...rest })
        setOrderList(orderList)
        orderMap.set(id, orderList.length - 1)
        setOrderMap(orderMap)
        setLastUpdate(new Date().valueOf())
    }

    /**
     * Updates an existing order
     * @param {string} orderId 
     * @param {OrderType} info 
     */
    const updateOrder = (orderId: string, info: Partial<OrderType>) => {
        const orderIndex = orderMap.get(orderId)
        if (orderIndex === undefined) return
        
        // TODO create hook for a single order type to implement dual data binding
        orderList[orderIndex] = { ...orderList[orderIndex], ...info }
        setOrderList(orderList)
        setLastUpdate(new Date().valueOf())
    }

    /**
     * Process a single order from in-bound order flow
     * @param {OrderType} orderEntry 
     */
    const processSingleOrder = (orderEntry: OrderType) => {
        const { id } = orderEntry
        if (!id) return
        
        if (orderMap.has(id)) updateOrder(id, orderEntry)
        else pushOrder(orderEntry)
    }

    /**
     * Connect the order flow via socket layer
     * connect only once
     * TODO cleanup on unmount
     * */
    const connectOrderFlowSocket = useCallback(() => {
        if (socketConnected) return // connect only once

        socket.on(OrderEvent.NewOrder, (orderPacket: any) => {
            if (!orderPacket || !orderPacket.length) return
            
            // TODO caching mechanism
            const packetCount = orderPacket.length
            const secondStamp = orderPacket[0]['sent_at_second']
            let newOrder = 0
            orderPacket.forEach((orderEntry: OrderType) => {
                if (!orderMap.has(orderEntry.id)) {
                    newOrder ++
                }
                // TODO basic order validation
                processSingleOrder(orderEntry)
            })

            console.log(`>>> Received ${newOrder} new orders and updated ${packetCount - newOrder} at second: ${secondStamp}`)
            // console.log(JSON.stringify(orderPacket, null, 2))
        })
        setConnection(true)
    /* eslint-disable-next-line react-hooks/exhaustive-deps  */
    }, [])

    /**
     * Filter orders by the given criteria
     * price must be exact match, while other properties are loosely match
     * @param {OrderFilterCriteria} criteria
     */
    useEffect(() => {
        const propsToApply = Object.entries(filterCriteria)
            .filter(([prop, value]) => Object.hasOwnProperty.call(filterCriteria, prop) && value)
            .map(([prop]) => prop)

        if (!propsToApply.length) {
            console.log('clearing filters')
            setFilteredOrderList(undefined)
        }
        else {
            const filteredList = orderList.filter((orderEntry: OrderType) => {
                return propsToApply.every(prop => {
                    switch(prop) {
                        case 'customer':
                        case 'destination':
                        case 'item':
                        case 'event_name':
                            return orderEntry[prop].includes(filterCriteria[prop] as string)
                        case 'price':
                            return orderEntry[prop] === filterCriteria[prop]
                        default:
                            return false
                    }
                })
            })
            setFilteredOrderList(filteredList)
            console.log(filteredList)
        }
    }, [orderList, filterCriteria, setFilteredOrderList])
    // }, [orderList, filterCriteria, lastUpdate])

    return {
        orderMap, orderList, filteredOrderList, orderCount,
        connectOrderFlowSocket, setFilterCriteria, setFilteredOrderList,
    }
}

// TODO move to an individual type definition file
export enum OrderStatus {
    CREATED = 'CREATED',
    COOKED = 'COOKED',
    DRIVER_RECEIVED = 'DRIVER_RECEIVED',
    DELIVERED ='DELIVERED',
    CANCELLED = 'CANCELLED',
} 

export type OrderType = {
    customer: string,
    destination: string,
    event_name: OrderStatus,
    id: string,
    item: string,
    price: number,
    sent_at_second: number
}

export type OrderFilterCriteria = Partial<Omit<OrderType, 'id' | 'sent_at_second'>>
