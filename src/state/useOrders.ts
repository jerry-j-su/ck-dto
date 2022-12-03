/**
 * Order flow layer
 */
import { useEffect, useCallback } from 'react'

import { simpleUID, createGlobalPersistentState, reverseIndexMap } from '../utils'
import { OrderType, OrderFilterCriteria } from '../types'
import { OrderEvent, orderFlowSocket } from '../service'

/**
 * Globalized order states
 */
const useSocketConnection = createGlobalPersistentState<boolean>(() => false)
const useGlobalOrderMap = createGlobalPersistentState<Map<string, number>>(() => new Map())
const useGlobalOrderList = createGlobalPersistentState<OrderType[]>(() => [])
const useOrderCount = createGlobalPersistentState<number>(() => 0)
const useFilterCriteria = createGlobalPersistentState<OrderFilterCriteria>(() => ({}))
const useFilteredOrderList = createGlobalPersistentState<OrderType[] | undefined>(() => [])
const useLastUpdate = createGlobalPersistentState<number>(() => Date.now())

/**
 * Reverse Index for search
 */
const priceMap = reverseIndexMap<OrderType['price'], number>()
// @ts-ignore
window.priceMap = priceMap

export default function useOrders() {
    const [socketConnected, setConnection] = useSocketConnection()
    const [orderMap, setOrderMap] = useGlobalOrderMap()
    const [orderList, setOrderList] = useGlobalOrderList()
    const [orderCount, setOrderCount] = useOrderCount()
    const [filterCriteria, setFilterCriteria] = useFilterCriteria()
    const [filteredOrderList, setFilteredOrderList] = useFilteredOrderList()

    // last update time stamp, also an indicator to inform re-rendering of underlying components
    const [lastUpdate, setLastUpdate] = useLastUpdate()

    useEffect(() => setOrderCount(orderMap.size), [setOrderCount, orderMap, lastUpdate])

    /**
     * Register a new order
     */
    const addOrder = (orderEntry: OrderType) => {
        const { id, price, ...rest } = orderEntry
        orderList.push({ id, price, ...rest })
        setOrderList(orderList)
        orderMap.set(id, orderList.length - 1)
        setOrderMap(orderMap)
        priceMap.put(price, orderList.length - 1)
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
        else addOrder(orderEntry)
    }

    /**
     * Connect the order flow via socket layer
     * connect only once
     * TODO cleanup on unmount
     * */
    const connectOrderFlowSocket = useCallback(() => {
        if (socketConnected) return // connect only once

        orderFlowSocket.emit(OrderEvent.Connect, {
            socketId: orderFlowSocket.id,
            tokenId: simpleUID(10),
        })

        orderFlowSocket.on(OrderEvent.NewOrder, (orderPacket: any) => {
            if (!orderPacket || !orderPacket.length) return

            // TODO caching mechanism
            // const packetCount = orderPacket.length
            // const secondStamp = orderPacket[0]['sent_at_second']
            // let newOrder = 0
            orderPacket.forEach((orderEntry: OrderType) => {
                // if (!orderMap.has(orderEntry.id)) {
                //     newOrder ++
                // }
                // TODO basic order validation
                processSingleOrder(orderEntry)
            })

            // console.log(`>>> Received ${newOrder} new orders and updated ${packetCount - newOrder} at second: ${secondStamp}`)
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
        const filteredList = filterOrderListByPrice(orderList, filterCriteria.price);
        setFilteredOrderList(filteredList)
    }, [orderList, orderList.length, filterCriteria, setFilteredOrderList])

    return {
        orderMap, orderList, filteredOrderList, orderCount,
        connectOrderFlowSocket, setFilterCriteria, setFilteredOrderList,
    }
}

/**
 * Filter the order list under given criteria
 * @param {OrderType[]} orderList
 * @param {OrderType.price} price
 */
export function filterOrderListByPrice(orderList: OrderType[], price?: OrderType['price']) {
    if (typeof price !== 'number') return undefined
    const indexes =  priceMap.get(price)
    return Array.isArray(indexes) ? indexes.map(index => orderList[index]) : []
}
