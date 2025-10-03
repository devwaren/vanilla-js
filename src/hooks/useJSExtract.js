import { useJSParams } from './useJSParams';


export function useJSExtractParams(pattern) {
    const store = useJSParams.getState();

    // Populate internal param/query store
    store.setFromPattern(pattern);

    const params = store.params;
    const query = store.query;

    return { ...params, ...query };
}
