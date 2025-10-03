import DOMPurify from "dompurify";


export const useJSPurifier = (
  input,
  config
) => {
  const defaultConfig = {
    ADD_TAGS: ["my-custom-tag"],
  };

  const mergedConfig = { ...defaultConfig, ...config };

  if (typeof input === "string") {
    return DOMPurify.sanitize(input, mergedConfig);
  } else {
    return DOMPurify.sanitize(input.innerHTML, mergedConfig);
  }
};
