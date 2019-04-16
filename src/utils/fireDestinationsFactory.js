import isObject from "./isObject";
import isNonEmptyString from "./isNonEmptyString";
import fireImage from "./fireImage";

const fireOnPage = fireImage;

export default ({ iframe, logger }) => {
  const fireInIframe = ({ url }) => {
    if (iframe) {
      const currentDocument = iframe.contentWindow.document;

      fireImage({ url, currentDocument });
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
              fireInIframe({ url });
            } else {
              fireOnPage({ url });
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
  };
};
