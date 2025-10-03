import DOMPurify from "dompurify";
import { useJSCSP } from "./useJSCSP";


export const useJSMetaData = (
  config,
  cspConfig,
) => {
  let metaData = {
    name: DOMPurify.sanitize(config.name || ""),
    title: DOMPurify.sanitize(config.title || ""),
    description: DOMPurify.sanitize(config.description || "Default description"),
    author: DOMPurify.sanitize(config.author || ""),
    favicon: config.favicon,
  };

  const setName = (name) => {
    metaData.name = DOMPurify.sanitize(name);
    updateMetaTag("name", metaData.name);
  };

  const setTitle = (title) => {
    metaData.title = DOMPurify.sanitize(title);
    document.title = metaData.title;
  };

  const setDescription = (description) => {
    metaData.description = DOMPurify.sanitize(description);
    updateMetaTag("description", metaData.description);
  };

  const setAuthor = (author) => {
    metaData.author = DOMPurify.sanitize(author);
    updateMetaTag("author", metaData.author);
  };

  const setFavicon = (url) => {
    metaData.favicon = DOMPurify.sanitize(url);
    let link = document.querySelector(`link[rel="icon"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = metaData.favicon;
  };

  const getName = () => metaData.name;
  const getTitle = () => metaData.title;
  const getDescription = () => metaData.description;
  const getAuthor = () => metaData.author;
  const getFavicon = () => metaData.favicon;
  const getAllMetaData = () => metaData;

  const createMetaTag = (name, content) => {
    const metaTag = document.createElement("meta");
    metaTag.setAttribute("name", name);
    metaTag.setAttribute("content", content);
    document.head.appendChild(metaTag);
  };

  const updateMetaTag = (name, content) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (metaTag) {
      metaTag.setAttribute("content", content);
    } else {
      createMetaTag(name, content);
    }
  };

  const appendMetaTagsToHead = () => {
    if (metaData.title) document.title = metaData.title;
    if (metaData.name) updateMetaTag("name", metaData.name);
    if (metaData.description) updateMetaTag("description", metaData.description);
    if (metaData.author) updateMetaTag("author", metaData.author);
    if (metaData.favicon) setFavicon(metaData.favicon);
  };

  // Apply CSP if config provided
  if (cspConfig) {
    useTSCSP(
      cspConfig.scriptSrc,
      cspConfig.styleSrc,
      cspConfig.objectSrc,
      Array.isArray(cspConfig.connectSrc) ? cspConfig.connectSrc.join(" ") : cspConfig.connectSrc,
      cspConfig.reportOnly !== undefined ? String(cspConfig.reportOnly) : undefined
    );
  }

  appendMetaTagsToHead();

  return {
    setName,
    setTitle,
    setDescription,
    setAuthor,
    setFavicon,
    getName,
    getTitle,
    getDescription,
    getAuthor,
    getFavicon,
    getAllMetaData,
    appendMetaTagsToHead,
  };
};
