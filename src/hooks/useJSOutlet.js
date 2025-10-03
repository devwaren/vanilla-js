

export const useJSOutlet = (
    selector,
    outlets
) => {
    const outletDOM = document.querySelector(`#${selector}`)
        || document.querySelector(`.${selector}`);

    if (!outletDOM) return;

    const currentPath = window.location.pathname.replace(/\/$/, "");

    for (const outlet of outlets) {
        const base = outlet.path.replace(/\/$/, "");

        // Match exact or nested path (e.g., /openai/child/1)
        if (currentPath === base || currentPath.startsWith(`${base}/`)) {
            outlet.component(outletDOM);
            break;
        }
    }
};


export function renderChildRoutes(DOM, router) {
    const pathname = window.location.pathname.replace(/\/$/, "");

    router.routes.forEach((route) => {
        if (!route.children?.length) return;

        route.children.forEach((child) => {
            const childPath = child.path.replace(/\/$/, "");

            if (pathname === childPath || pathname.startsWith(`${childPath}/`)) {
                const outlet = DOM.querySelector(`#${child.outlet}`)
                    || DOM.querySelector(`.${child.outlet}`);
                if (outlet instanceof HTMLElement && child.element) {
                    child.element(outlet);
                }
            }
        });
    });
}