/**
 * Inverse index hash table for quick search
 */
function reverseIndexMap<KeyType, I> () {
    const _map = new Map<KeyType, I[]>()

    return {
        clear() {
            const keys = _map.keys()
            let isDone = false
            do {
                const { value: key, done } = keys.next()
                _map.delete(key)
                isDone = !!done
            }
            while (!isDone)
        },

        get: _map.get.bind(_map),

        put(key: KeyType, index: I) {
            const bucket = _map.get(key)
            if (Array.isArray(bucket)) bucket.push(index)
            else _map.set(key, [index])
        },

        keys: _map.keys.bind(_map),

        /* methods that are not needed */

        // size(key: KeyType) {
        //     if (key) return (_map.get(key) || []).length
        //     let length = 0
        //     for(const bucket of _map.values()) {
        //         length += (bucket || []).length
        //     }
        //     return length;
        // },

        // delete(key: KeyType) {},

        // has(key: KeyType) {
        //     return Array.isArray(_map[key] && _map[key].length > 0)
        // }

        // entries: _map.entries.bind(_map),
    }
}

export default reverseIndexMap;
