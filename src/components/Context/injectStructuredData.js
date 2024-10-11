import { deepAssign } from "../../utils";

export default (window) => (xdm) => {

  const linkedData = Array.from(window.document.querySelectorAll('script[type="application/ld+json"]'))
    .map(e => e.innerHTML)
    .map(JSON.parse)

  if (linkedData.length) {
    deepAssign(xdm, { structuredData: { linkedData } });
  }
}
