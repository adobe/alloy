
export const INTERACTIVE = "interactive";
export const COMPLETE = "complete";
export const HASHCHANGE = "hashchange";

export default ({ window }) => {

  const document = window.document;

  return (event, handler) => {
    switch (event) {
      case INTERACTIVE:
        if (document.readyState === INTERACTIVE) {
          handler();
        } else {
          document.addEventListener("DOMContentLoaded", handler);
        }
        break;
      case COMPLETE:
        if (document.readyState === COMPLETE) {
          handler();
        } else {
          window.addEventListener("load", handler);
        }
        break;
      default:
        window.addEventListener(event, handler);
    }
  };
}
