

export const useJSEvent = (
  id,
  eventType,
  handler
) => {
  if (typeof id === 'string') {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(
        eventType,
        handler
      );
    } else {
      console.warn(`Element with id '${id}' not found.`);
    }
  } else if (id === document) {
    document.addEventListener(
      eventType,
      handler
    );
  } else {
    console.warn(`Invalid id parameter provided.`);
  }
};
