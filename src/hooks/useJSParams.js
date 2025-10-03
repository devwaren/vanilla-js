// utils/hooks/useTSParams.ts
import { createStore } from 'zustand/vanilla';
import DOMPurify from 'dompurify';



function extractPatternParams(pattern, path) {
    const paramNames = [];
    const regexPattern = pattern.replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);
    const result = {};

    if (match) {
        paramNames.forEach((name, i) => {
            result[name] = DOMPurify.sanitize(match[i + 1] ?? '');
        });
    }

    return result;
}

function extractQueryParams(search) {
    const result = {};
    const urlSearchParams = new URLSearchParams(search);

    for (const [key, value] of urlSearchParams.entries()) {
        result[key] = DOMPurify.sanitize(value);
    }

    return result;
}

export const useJSParams = createStore < ParamStore > ((set, get) => ({
    params: {},
    query: {},
    setFromPattern: (pattern) => {
        const path = window.location.pathname;
        const params = extractPatternParams(pattern, path);
        const query = extractQueryParams(window.location.search);
        set({ params, query });
    },
    getParam: (key) => get().params[key],
    getQuery: (key) => get().query[key],
}));
