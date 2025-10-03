


export const useJSElementEach = (
  elements,
  events,
  callback
) => {
  elements.forEach(element => {
    events.forEach(eventType => {
      element.addEventListener(eventType, event => {
        callback(element, event);
      });
    });
  });
};
