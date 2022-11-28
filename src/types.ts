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


// For Global Persistent State hook & hook factory
export type IGlobalStateInitiator<S> = S | (() => S)
export type IGlobalStateSetter<S> = S | (() => S)
