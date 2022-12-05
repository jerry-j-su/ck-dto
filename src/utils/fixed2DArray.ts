const DEFAULT_BLOCK_SIZE = 1000

export interface IFixed2DArray<I> {
    get: (index: number) => I | undefined,
    length: number,
    add: (item: I) => number,
    set: (index: number, item: I) => IFixed2DArray<I>,
    toArray: () => I[],
    slice: (start?: number, end?: number) => I[],
}

export default function fixed2DArray<I> ({ blockSize = DEFAULT_BLOCK_SIZE }: { blockSize?: number } = {}): IFixed2DArray<I> {
    if (!Number.isInteger(blockSize) || blockSize <= 0) {
        throw new Error('Invalid block size')
    }

    const _blockSize = blockSize        // the fixed block size (width of each row)
    const _table: I[][] = []            // internal table for data storage
    const _pos = { x: 0, y: 0 }         // pointer
    let _length = 0                     // item count

    /**
     * Move position forward, warp it to the beginning of the next new block upon reaching the end of previous one
     */
    const forward = () => {
        if (_pos.x < _blockSize - 1) _pos.x ++
        else {
            _pos.x = 0
            _pos.y ++
        }
        _length ++
    }

    return {
        /**
         * Return the indexed item, index is the flatten position
         * @param {number} index
         */
        get(index: number) {
            if (index < 0 || index >= this.length) {
                return undefined
            }
            const x = index % _blockSize
            const y = Math.floor(index / _blockSize)
            return _table[y][x]
        },
        /**
         * Return the size of the 2D array
         */
        get length() {
            return _length
        },
        /**
         * Add an item in the next available position
         * @param {I} item
         */
        add(item: I) {
            if (!_table[_pos.y]) {
                _table[_pos.y] = new Array(_blockSize)
            }
            _table[_pos.y][_pos.x] = item
            forward()
            return this.length
        },
        /**
         * Modify an existing item in the 2D array
         * @param {number} index
         * @param {I} item
         */
        set(this: IFixed2DArray<I>, index: number, item: I): IFixed2DArray<I> {
            if (index < 0 || index >= this.length) {
                throw new Error('out-of-range error')
            }
            const x = index % _blockSize
            const y = Math.floor(index / _blockSize)
            _table[y][x] = item
            return this
        },
        /**
         * Return a primitive array containing a portion of the items in the table. The portion is specified by the start and end index
         * @param {number} start - the flattened index of start position
         * @param {number} end - the flattened index of end position
         */
        slice(this: IFixed2DArray<I>, start: number = 0, end: number = this.length) {
            const actualStart = start >= 0
                ? Math.min(start, this.length - 1)
                : Math.max(-this.length, start) + this.length
            const actualEnd = end >= 0
                ? Math.min(end, this.length)
                : Math.max(-this.length, end) + this.length

            if (actualStart >= actualEnd) return []

            const startX = actualStart % _blockSize
            const startY = Math.floor(actualStart / _blockSize)
            const endX = actualEnd % _blockSize
            const endY = Math.floor(actualEnd / _blockSize)

            const moreThanOneBlock = endY > startY
            return _table
                .slice(startY, endY + 1)
                .reduce((acc, block, index, subset) => {
                    switch (index) {
                        case 0:
                            return acc.concat(block.slice(startX, moreThanOneBlock ? _blockSize : endY))
                        case subset.length - 1:
                            return acc.concat(block.slice(0, endX || _blockSize))
                        default:
                            return acc.concat(block)
                    }
                }, [])
        },
        /**
         * Returns the flatten primitive array for UI to consume
         * @returns
         */
        toArray() {
            return _table.reduce((acc, block, blockIndex) => {
                return (blockIndex < _pos.y) ? acc.concat(block) : acc.concat(block.filter(Boolean))
            }, [])
        },

        // map() {

        // },

        // reverse() {

        // },

        // debug
        // @ts-ignore
        // p_table() {
        //     console.log(_table)
        // },
    }
}
