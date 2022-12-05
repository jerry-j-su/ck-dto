/**
 * If order list is held rendering due to performance, Skeletons will be rendered until further content nodes are added
 */
export default function OrderSkeleton() {
    return (
        <>
            <div className="skeleton-title" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
        </>
    )
}
