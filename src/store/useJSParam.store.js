import { createStore } from "zustand/vanilla";
import DOMPurify from "dompurify";



export const jsParamsStore = createStore((set) => ({
    params: {},
    query: {},
    setParams: (params) =>
        set(() => ({
            params: sanitize(params),
        })),
    setQuery: (query) =>
        set(() => ({
            query: sanitize(query),
        })),
}));

function sanitize(obj) {
    const output = {};
    for (const key in obj) {
        output[key] = DOMPurify.sanitize(obj[key]);
    }
    return output;
}
