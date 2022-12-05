import OrderSkeleton from "../components/OrderSkeleton";

test('<OrderSkeleton Basic Rendering', () => {
    expect(OrderSkeleton()).toMatchSnapshot()
})
