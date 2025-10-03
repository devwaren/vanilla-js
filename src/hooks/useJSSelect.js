

const useJSSelect = (
    selector,
    scope
) => {
    const root = scope ?? document;
    const elements = root.querySelectorAll(selector);

    if (elements.length === 0) {
        if (process.env.NODE_ENV !== "production") {
            console.warn(`[useJSSelect] No element found for selector: '${selector}'`);
        }
        return null;
    }

    if (selector.startsWith("#") && elements.length > 1) {
        if (process.env.NODE_ENV !== "production") {
            throw new Error(
                `[useJSSelect] Duplicate ID detected: '${selector}'. Found ${elements.length} elements with this ID.`
            );
        }
        return elements[0]; // fallback: just return first
    }

    if (elements.length > 1) {
        if (process.env.NODE_ENV !== "production") {
            console.warn(
                `[useJSSelect] Multiple elements found for selector: '${selector}'. Returning the first one.`
            );
        }
    }

    return elements[0];
};

export { useJSSelect };
