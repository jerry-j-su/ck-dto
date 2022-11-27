import React, {
useCallback, useState, useRef,
FormEvent, FormEventHandler,
} from 'react'

import { tailingDebounce } from '../utils'
import useOrders from '../hooks/useOrderFlow'
import './SearchBox.scss'

/**
 * Validate price input value
 * Currently it only allows pure number
 * @param {string} rawValue
 */
function validatePriceInput(rawValue: string) {
    return /^\s*\d*\.?\d*\s*$/.test(rawValue)
}

export function InputBox({ value, onInput, clearInput }: { value: string, onInput: FormEventHandler, clearInput: FormEventHandler }) {
    const inputDOM = useRef<HTMLInputElement>(null)
    return (
        <div className="search-input" tabIndex={0}>
            {!(inputDOM.current && inputDOM.current.value) && <div className="search-placeholder">Enter price to search among orders...</div>}
            <input type="combobox" value={value} onInput={onInput} ref={inputDOM} />
            {value && <div className="search-clear" onClick={clearInput}>X</div>}
        </div>
    )
}

export default function SearchBox() {
    const [searchStr, setSearchStr] = useState<string>('')
    const [warnMsg, setWarnMsg] = useState<string>('')
    const { setFilterCriteria } = useOrders()

    /**
     * Perform an order search, debounced, tailing, 500ms
     */
    const performSearch = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        tailingDebounce((price?: number) => {
            console.log(`searching price: ${price}`)
            setFilterCriteria({ price })
        }, 500),
        [setFilterCriteria]
    )

    /* Handlers */
    const clear = useCallback(() => {
        setSearchStr('')
        setWarnMsg('')
        performSearch()
    }, [setSearchStr, performSearch])

    /**
     * Handler to parse and validate search input
     */
    const onSearchInput: FormEventHandler = useCallback((event: FormEvent) => {
        // @ts-ignore
        const { target: { value: rawInput } } = event
        setSearchStr(rawInput)
        if (validatePriceInput(rawInput)){
            setWarnMsg('')
            const price = parseInt(rawInput) || undefined
            performSearch(price)
        } else {
            setWarnMsg('Invalid price amount')
        }
    }, [setSearchStr, performSearch])

    return (
        <section className="search-container">
            <InputBox value={searchStr} onInput={onSearchInput} clearInput={clear} />
            {warnMsg && <div className="search-notification">{warnMsg}</div>}
        </section>
    )
}
