

export const useJSAddBg = (
  elementSelect,
  background,
  textOptions
) => {
  const element = document.querySelector(elementSelect)
  if (element) {
    if (background.image) {
      element.style.backgroundImage = `url(${background.image})`;
      element.style.backgroundSize = String(background.size);
      element.style.backgroundRepeat = background.repeat || "no-repeat";
      element.style.backgroundPosition = background.position || "center";
    } else if (background.color) {
      element.style.backgroundColor = background.color;
    }
    element.style.color = String(textOptions?.textColor);
    element.style.fontSize = String(textOptions?.textSize);
    element.style.lineHeight = String(textOptions?.lineHeight);
    element.style.fontFamily = String(textOptions?.fontFamily);
    element.style.fontStyle = String(textOptions?.fontStyle);
  } else {
    console.error(`Element with queried ${elementSelect} not found.`);
  }
};
