import isNil from "./isNil";
import isNonEmptyString from "./isNonEmptyString";
import fireImage from "./fireImage";
import { appendNode, awaitSelector, createNode } from "./dom";

const fireOnPage = fireImage;

const BODY_TAG = "BODY";
const IFRAME_TAG = "IFRAME";
const IFRAME_ATTRS = {
  name: "Adobe Destinationing iFrame",
  class: "adobe-iframe",
  style: "display: none; width: 0; height: 0;"
};

export default ({ logger, destinations }) => {
  const createIframe = (() => {
    let iframePromise;
    return () => {
      if (!iframePromise) {
        iframePromise = awaitSelector(BODY_TAG).then(([body]) => {
          const iframe = createNode(IFRAME_TAG, IFRAME_ATTRS);
          return appendNode(body, iframe);
        });
      }
      return iframePromise;
    };
  })();

  const fireInIframe = ({ attributes }) => {
    return createIframe().then(iframe => {
      const currentDocument = iframe.contentWindow.document;
      fireImage({ attributes, currentDocument });
    });
  };

  return Promise.all(
    destinations.map(dest => {
      return new Promise((resolve, reject) => {
        if (isNonEmptyString(dest.url)) {
          if (!isNil(dest.hideReferrer)) {
            const attributes = {
              onload: resolve,
              onerror: () => {
                logger.log(`Destination failed: ${dest.url}`);
                reject();
              },
              onabort: () => {
                logger.log(`Destination aborted: ${dest.url}`);
                reject();
              },
              src: dest.url
            };

            if (dest.hideReferrer) {
              fireInIframe({ attributes });
            } else {
              fireOnPage({ attributes });
            }
          }
          logger.error(
            `Destination hideReferrer property is not defined for url ${
              dest.url
            } .`
          );
        } else {
          logger.error("Destination url is not a populated string.");
        }
      });
    })
  );
};
