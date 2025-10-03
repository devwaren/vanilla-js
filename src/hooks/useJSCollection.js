import { useJSComponent } from "./useJSComponent";

export const useJSCollection = (
  collections,
  DOM,
  elements,
  params = []
) => {
  const seenIds = new Set();

  collections.forEach((id, index) => {
    // Check for duplicate IDs in the collection list itself
    if (seenIds.has(id)) {
      console.warn(`[useJSCollection] Duplicate ID in collection array: "${id}" — skipping.`);
      return;
    }
    seenIds.add(id);

    // Check for duplicates already in DOM
    const matches = DOM.querySelectorAll(`#${id}`);
    if (matches.length > 1) {
      console.warn(
        `[useJSCollection] Duplicate ID in DOM: "${id}" (${matches.length} elements found) — skipping component mount.`
      );
      return;
    }

    const elementFn = elements[index];
    const param = Array.isArray(params) ? params[index] : undefined;

    if (typeof elementFn === "function") {
      useJSComponent(id, DOM, elementFn, param);
    } else {
      console.warn(`[useJSCollection] No valid component function found for ID: "${id}"`);
    }
  });
};
