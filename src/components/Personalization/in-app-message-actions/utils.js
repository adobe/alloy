export const addStyle = (styleTagId, cssText) => {
  const existingStyle = document.getElementById(styleTagId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const styles = document.createElement("style");
  styles.id = styleTagId;

  styles.appendChild(document.createTextNode(cssText));
  document.head.appendChild(styles);
};

export const removeElements = cssClassName => {
  [...document.getElementsByClassName(cssClassName)].forEach(element => {
    if (!element) {
      return;
    }
    element.remove();
  });
};
