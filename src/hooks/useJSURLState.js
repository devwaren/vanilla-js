import DOMPurify from "dompurify";


export const useJSURLState = () => {
  const params = new URLSearchParams(window.location.search);
  const sanitizedParams = {};

  for (const [key, value] of params.entries()) {
    sanitizedParams[key] = DOMPurify.sanitize(value);
  }

  return sanitizedParams;
};

// Function to check for ?= in the URL and remove it
export const useJSCheckInvalidParams = () => {
  const url = window.location.href;
  const regex = /(\?.*?)?=/;

  if (regex.test(url)) {
    // Remove the ?= from the URL
    const cleanedUrl = url.replace(regex, "");
    window.history.replaceState(null, "", cleanedUrl);
    // If you want to reload the page, use the following line instead:
    window.location.replace(cleanedUrl);
  }
};
