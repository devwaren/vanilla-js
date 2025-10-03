import DOMPurify from "dompurify";



// Attach popstate listener only in the browser
if (typeof window !== "undefined" && !window.__anchorSinglePopstateHandlerAttached) {
  window.addEventListener("popstate", (e) => {
    const state = e.state
    if (state?.scrollPosition !== undefined) {
      window.scrollTo(0, state.scrollPosition);
    }
  });
  window.__anchorSinglePopstateHandlerAttached = true;
}

export const useJSAnchorSingle = (
  element,
  href,
  ariaLabel,
  className = "",
  childElement = null
) => {
  if (!element) return;

  // Sanitize string inputs
  const sanitizedHref = DOMPurify.sanitize(href, { ALLOWED_URI_REGEXP: /^(https?:|\/)/ });
  const sanitizedAriaLabel = DOMPurify.sanitize(ariaLabel, { USE_PROFILES: { html: false } });

  element.setAttribute("href", sanitizedHref);
  element.setAttribute("aria-label", sanitizedAriaLabel);

  if (className) {
    element.className = className.trim();
  }

  if (childElement) {
    element.replaceChildren(childElement);
  }

  // Event binding only in browser
  if (typeof window !== "undefined") {
    element.addEventListener("click", (e) => {
      e.preventDefault();
      const target = e.currentTarget
      const hrefAttr = target.getAttribute("href");
      if (hrefAttr) {
        const scrollPosition = window.scrollY;
        window.scrollTo(0, 0);
        window.history.pushState({ scrollPosition }, "", hrefAttr);
        dispatchEvent(new PopStateEvent("popstate"));
      }
    });
  }
};
