// useTSReactivity.js
import { createStore } from 'zustand/vanilla';

export function createSignal(initialValue) {
    const store = createStore<{ value: T }>(() => ({ value: initialValue }));
    const listeners = new Set();

    return {
        get: () => store.getState().value,
        set: (newValue) => {
            store.setState({ value: newValue });
            listeners.forEach((listener) => listener(newValue));
        },
        subscribe: (listener) => {
            listeners.add(listener);
            listener(store.getState().value); // Trigger immediately
            return () => listeners.delete(listener);
        },
    };
}


export function createEffect(effectFn) {
    const cleanup = effectFn();

    // Optional: return a way to dispose the effect manually
    if (typeof cleanup === 'function') {
        // You may store this and call it later if needed
        cleanup();
    }
}
