import fireImage from "./fireImage";
import { appendNode, awaitSelector, createNode, removeNode } from "./dom";

const fireOnPage = fireImage;

const BODY_TAG = "BODY";
const IFRAME_TAG = "IFRAME";
const IFRAME_ATTRS = {
  name: "Adobe Destinationing iFrame",
  class: "adobe-iframe",
  style: "display: none; width: 0; height: 0;"
};

const createFilterResultBySucceeded = succeeded => result =>
  result.succeeded === succeeded;
const mapResultToDest = result => result.dest;

export default ({ logger, destinations }) => {
  let iframePromise;

  const createIframe = () => {
    if (!iframePromise) {
      iframePromise = awaitSelector(BODY_TAG).then(([body]) => {
        const iframe = createNode(IFRAME_TAG, IFRAME_ATTRS);
        return appendNode(body, iframe);
      });
    }
    return iframePromise;
  };

  const fireInIframe = ({ src }) => {
    return createIframe().then(iframe => {
      const currentDocument = iframe.contentWindow.document;
      return fireImage({ src, currentDocument });
    });
  };

  return Promise.all(
    destinations.map(dest => {
      const imagePromise = dest.hideReferrer
        ? fireInIframe({ src: dest.url })
        : fireOnPage({ src: dest.url });

      return imagePromise
        .then(() => {
          logger.log(`Destination failed: ${dest.url}`);
          return {
            succeeded: true,
            dest
          };
        })
        .catch(() => {
          logger.log(`Destination aborted: ${dest.url}`);
          return {
            succeeded: false,
            dest
          };
        });
    })
  ).then(results => {
    if (iframePromise) {
      iframePromise.then(iframe => removeNode(iframe));
    }

    return {
      succeeded: results
        .filter(createFilterResultBySucceeded(true))
        .map(mapResultToDest),
      failed: results
        .filter(createFilterResultBySucceeded(false))
        .map(mapResultToDest)
    };
  });
};
