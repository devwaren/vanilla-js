export function useJSLazy(
    factory
) {
    let cachedModule = null;

    return async (el, props) => {
        try {
            if (!cachedModule) {
                const mod = await factory();
                cachedModule = (mod).default || mod;
            }

            // Function component (Vanilla TS style)
            if (typeof cachedModule === "function") {
                return (cachedModule)(el, props);
            }

            // Plain HTMLElement
            if (cachedModule instanceof HTMLElement) {
                const clone = cachedModule.cloneNode(true)
                el?.appendChild(clone);
                return clone;
            }

            // Object with a .render() method
            if (
                typeof cachedModule === "object" &&
                cachedModule !== null &&
                "render" in cachedModule &&
                typeof (cachedModule).render === "function"
            ) {
                return (cachedModule).render(el, props);
            }

            console.warn("useTSLazy: Unsupported module type", cachedModule);
        } catch (err) {
            console.error("useTSLazy failed:", err);
        }
    };
}
