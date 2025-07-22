/**
 * @param {string} src
 * @param {{ module?: boolean, async?: boolean }} [options]
 */
export default (src, { module = false, async = true } = {}) =>
  new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.type = "text/javascript";
    tag.src = src;
    tag.async = async;
    if (module) {
      tag.type = "module";
    }

    const nonce =
      document.querySelector('meta[property="nonce"]')?.getAttribute("nonce") ||
      document.querySelector("script[nonce]")?.getAttribute("nonce") ||
      "";
    tag.setAttribute("nonce", nonce);
    tag.addEventListener("load", resolve);

    document.head.appendChild(tag);
  });
