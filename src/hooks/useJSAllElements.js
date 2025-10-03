export const useJSEventAll =(
  selector,
  eventType,
  handler
) => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.addEventListener(eventType, handler);
  });

  return () => {
    elements.forEach(element => {
      element.removeEventListener(eventType, handler);
    });
  };
};

export const useJSEventSelectAll = (
  selectors,
  eventType,
  handler
) => {
  const elements = [];

  selectors.forEach(selector => {
    const selectedElements = document.querySelectorAll(
      selector
    );
    selectedElements.forEach(element => {
      element.addEventListener(eventType, handler);
    });
    elements.push(selectedElements);
  });

  return () => {
    elements.forEach(nodeList => {
      nodeList.forEach(element => {
        element.removeEventListener(eventType, handler);
      });
    });
  };
};
