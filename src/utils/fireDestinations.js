import isObject from "./isObject";
import isNonEmptyString from "./isNonEmptyString";
import fireImageOnPage from "./fireImageOnPage";

const fireOnPage = fireImageOnPage;

export default ({ iframe, logger }) => {
  const fireInIframe = url => {
    if (iframe) {
      if (isNonEmptyString(url)) {
        const img = iframe.contentWindow.document.createElement("img");

        img.src = url;
      }
    }
  };

  return (destinations = []) => {
    destinations.forEach(dest => {
      if (isObject(dest)) {
        if (isNonEmptyString(dest.url)) {
          const url = new RegExp(`^//:`, "i").test(dest.url)
            ? dest.url
            : `//${dest.url}`;

          if (typeof dest.hideReferrer !== "undefined") {
            if (dest.hideReferrer) {
              fireInIframe(url);
            } else {
              fireOnPage(url);
            }
          } else {
            logger.error(
              `Destination hideReferrer property is not defined for url ${
                dest.url
              } .`
            );
          }
        } else {
          logger.error("Destination url is not a populated string.");
        }
      } else {
        logger.error("Destination is not an object.");
      }
    });

    while (destinations.length) {
      destinations.shift();
    }
  };
};
