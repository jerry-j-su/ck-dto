/**
 * Order flow layer
 */
import { useEffect, useCallback } from 'react'

import {
    simpleUID, createGlobalPersistentState,
    fixed2DArray, reverseIndexMap
} from '../utils'
import { OrderType, OrderFilterCriteria } from '../types'
import { OrderEvent, orderFlowSocket } from '../service'

/**
 * Globalized order states
 */
const useSocketConnection = createGlobalPersistentState<boolean>(() => false)
const useGlobalOrderList = createGlobalPersistentState<OrderType[]>([])
const useOrderCount = createGlobalPersistentState<number>(() => 0)
const useFilterCriteria = createGlobalPersistentState<OrderFilterCriteria>(() => ({}))
const useFilteredOrderList = createGlobalPersistentState<OrderType[] | undefined>(() => [])
const useLastUpdate = createGlobalPersistentState<number>(() => Date.now())


/* Order Storage with Fixed-Width 2-Dimensional Array */
const orderStorage = fixed2DArray<OrderType>({ blockSize: 1000 })

/*
 * Reverse Index Map for search
 * price -> index(es) for quick price search, one-to-multiple mapping
 * id -> index for quick id search, one-to-one mapping
 */
const priceMap = reverseIndexMap<OrderType['price'], number>()
const idMap = new Map<OrderType['id'], number>()

export default function useOrders() {
    const [socketConnected, setConnection] = useSocketConnection()
    const [orderList, setOrderList] = useGlobalOrderList()
    const [orderCount, setOrderCount] = useOrderCount()
    const [filterCriteria, setFilterCriteria] = useFilterCriteria()
    const [filteredOrderList, setFilteredOrderList] = useFilteredOrderList()

    // last update time stamp, also an indicator to inform re-rendering of underlying components
    const [lastUpdate, setLastUpdate] = useLastUpdate()

    useEffect(() => setOrderCount(orderList.length), [setOrderCount, orderList, lastUpdate])

    /**
     * Register a new order
     */
    const addOrder = (orderEntry: OrderType) => {
        const { id, price, ...rest } = orderEntry
        orderStorage.add({ id, price, ...rest })
        setOrderList(orderStorage.toArray())
        idMap.set(id, orderStorage.length - 1)
        priceMap.put(price, orderStorage.length - 1)
        setLastUpdate(new Date().valueOf())
    }

    /**
     * Updates an existing order
     * @param {number} orderIndex
     * @param {OrderType} info
     */
    const updateOrder = (orderIndex: number, info: Partial<OrderType>) => {
        if (orderIndex === undefined) return

        orderStorage.set(orderIndex, { ...orderStorage.get(orderIndex), ...info } as OrderType)
        setOrderList(orderStorage.toArray())
        setLastUpdate(new Date().valueOf())
    }

    /**
     * Process a single order from in-bound order flow
     * @param {OrderType} orderEntry
     */
    const processSingleOrder = (orderEntry: OrderType) => {
        const { id } = orderEntry
        if (!id) return

        const orderIndex = idMap.get(id)
        if (orderIndex || orderIndex === 0) updateOrder(orderIndex, orderEntry)
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
                // if (!idMap.get(orderEntry.id)) {
                //     newOrder ++
                // }
                // TODO basic order validation
                processSingleOrder(orderEntry)
            })

            // console.log(`>>> Received ${newOrder} new orders and updated ${packetCount - newOrder} at second: ${secondStamp}`)
            // console.log(orderPacket)
        })
        setConnection(true)
        /* eslint-disable-next-line react-hooks/exhaustive-deps  */
    }, [])

    /**
     * Filter orders by the given criteria
     * (Currently on ly price filter is in-scope and supported, can be enhanced to cater keyword search for other order fields)
     * price must be exact match, while other properties are loosely match
     * @param {OrderFilterCriteria} criteria
     */
    useEffect(() => {
        const filteredList = filterOrderListByPrice(filterCriteria.price);
        setFilteredOrderList(filteredList)
    }, [orderList, orderList.length, filterCriteria, setFilteredOrderList])

    return {
        idMap, orderList, filteredOrderList, orderCount,
        connectOrderFlowSocket, setFilterCriteria, setFilteredOrderList,
    }
}

/**
 * Filter the order list by price
 * @param {OrderType.price} price
 */
export function filterOrderListByPrice(price?: OrderType['price']): OrderType[] | undefined {
    if (typeof price !== 'number') return undefined
    const indexes = priceMap.get(price)
    return Array.isArray(indexes)
        ? indexes.map(index => orderStorage.get(index)).filter(Boolean) as OrderType[]
        : []
}
