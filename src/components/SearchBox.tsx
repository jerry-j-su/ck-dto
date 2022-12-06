import React, {
useCallback, useState, useRef,
FormEvent, FormEventHandler,
} from 'react'

import { debounce, mergeClassNames } from '../utils'
import useOrders from '../state/useOrders'
import './SearchBox.scss'

type InputBoxProps = {
    value: string,
    onInput: FormEventHandler,
    clearInput: FormEventHandler,
    isInvalid?: boolean,
}

/**
 * Validate price input value
 * Currently it only allows pure number
 * @param {string} rawValue
 */
function validatePriceInput(rawValue: string) {
    return /^\s*\d*\.?\d*\s*$/.test(rawValue)
}

export function InputBox({ value, onInput, clearInput, isInvalid = false }: InputBoxProps) {
    const inputDOM = useRef<HTMLInputElement>(null)
    return (
        <div className={mergeClassNames(['search-input', isInvalid ? 'invalid' : ''])}>
            {!(inputDOM.current && inputDOM.current.value) && <div className="search-placeholder">Enter price to search among orders...</div>}
            <input
                type="text"
                value={value}
                onInput={onInput}
                ref={inputDOM}
                aria-label="Input price to search among orders"
                aria-invalid={isInvalid}
                aria-errormessage="search-error-msg"
            />
            {value && <button type="button" className="search-clear" onClick={clearInput} aria-label="clear search">X</button>}
        </div>
    )
}

export default function SearchBox() {
    const [searchStr, setSearchStr] = useState<string>('')
    const [warnMsg, setWarnMsg] = useState<string>('')
    const { setFilterCriteria } = useOrders()
    const inputInvalid = !!warnMsg

    /**
     * Perform an order search, debounced, trailing, 500ms
     */
    const performSearch = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        debounce((price?: number) => {
            // console.log(`searching price: ${price}`)
            setFilterCriteria({ price })
        }, 250, { trailing: true }),
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
            setWarnMsg('Invalid format. Only price search is supported at the moment, please enter number only')
        }
    }, [setSearchStr, performSearch])

    return (
        <section className="search-container">
            <InputBox value={searchStr} onInput={onSearchInput} clearInput={clear} isInvalid={inputInvalid} />
            {inputInvalid && <div id="search-error-msg" className="search-notification">{warnMsg}</div>}
        </section>
    )
}
