export default (src) =>
  new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.type = "text/javascript";
    tag.src = src;
    tag.async = true;

    const nonce =
      document.querySelector('meta[property="nonce"]')?.getAttribute("nonce") ||
      document.querySelector("script[nonce]")?.getAttribute("nonce") ||
      "";
    tag.setAttribute("nonce", nonce);
    tag.addEventListener("load", resolve);

    document.head.appendChild(tag);
  });
