import isNil from "./isNil";
import isNonEmptyString from "./isNonEmptyString";
import fireImage from "./fireImage";

const fireOnPage = fireImage;

export default ({ iframe, logger, destinationsProcessedDeferred }) => {
  const fireInIframe = ({ attributes }) => {
    if (iframe) {
      const currentDocument = iframe.contentWindow.document;

      fireImage({ attributes, currentDocument });
    }
  };

  return (destinations = []) => {
    const processedDests = {
      loaded: [],
      errored: [],
      aborted: []
    };

    const numberOfDestinations = destinations.length;

    const checkForCompletion = () => {
      const processed =
        processedDests.loaded.length +
        processedDests.errored.length +
        processedDests.aborted.length;

      if (processed === numberOfDestinations) {
        logger.log(
          `All destinations processed. Loaded: ${
            processedDests.loaded.length
          }; errored: ${processedDests.errored.length}; aborted: ${
            processedDests.aborted.length
          }`
        );

        destinationsProcessedDeferred.resolve(processedDests);
      }
    };

    destinations.forEach(dest => {
      if (isNonEmptyString(dest.url)) {
        if (!isNil(dest.hideReferrer)) {
          const attributes = {
            onload: () => {
              processedDests.loaded.push(dest);
              checkForCompletion();
            },
            onerror: () => {
              processedDests.errored.push(dest);
              checkForCompletion();
            },
            onabort: () => {
              processedDests.aborted.push(dest);
              checkForCompletion();
            },
            src: dest.url
          };

          if (dest.hideReferrer) {
            fireInIframe({ attributes });
          } else {
            fireOnPage({ attributes });
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
    });
  };
};
