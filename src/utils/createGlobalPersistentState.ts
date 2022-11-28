import { useState, useEffect, useLayoutEffect } from 'react';

import { IGlobalStateInitiator, IGlobalStateSetter } from '../types'

function resolveNextState<S>(nextState: IGlobalStateSetter<S>): S {
    return typeof nextState === 'function' ? (nextState as Function)() : nextState
}

export function createGlobalPersistentState<S = any>(
    initialState: IGlobalStateInitiator<S>
): () => [S, (state: ((IGlobalStateSetter<S>))) => void];
export function createGlobalPersistentState<S = undefined>(): () => [
    S,
    (state: IGlobalStateSetter<S>) => void
];

/**
 * The useGlobalState hook factory
 * @param initialState
 * @returns
 */
export function createGlobalPersistentState<S>(initialState?: S) {
    /* Closure to persist a global store for the given state */
    const store: {
        state: S;
        setState: (state: IGlobalStateSetter<S>) => void;
        setters: any[];
    } = {
        state: initialState instanceof Function ? initialState() : initialState,
        // broadcast the state change to all components accessing this global state, so that they can be updated
        setState(nextState: IGlobalStateSetter<S>) {
            store.state = resolveNextState(nextState);
            store.setters.forEach((setter) => setter(store.state));
        },
        // setter list, any component connects to this global state must register its own state setter here
        setters: [],
    };

    /*
      the hook for Component to access the global state
      It is private React.useState that initialized and sync with the global state value
      usage is similar to React.useState
    */
    return () => {
        const [globalState, stateSetter] = useState<S | undefined>(store.state);

        // clean up registered setter upon component unmount
        useEffect(() => () => {
            store.setters = store.setters.filter((setter) => setter !== stateSetter);
        }, []);

        // register the setter to the setter list so that change from other component can trigger the state setter of this component
        useLayoutEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
            if (!store.setters.includes(stateSetter)) {
                store.setters.push(stateSetter);
            }
        });

        return [globalState, store.setState];
    };
}

export default createGlobalPersistentState;
