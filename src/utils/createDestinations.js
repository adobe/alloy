import { awaitSelector, createNode, appendNode, removeNode } from "./dom";
import fireDestinationsFactory from "./fireDestinationsFactory";
import defer from "./defer";

const BODY_TAG = "BODY";
const IFRAME_TAG = "IFRAME";
const IFRAME_ATTRS = {
  name: "Adobe Destinationing iFrame",
  class: "adobe-iframe",
  style: "display: none; width: 0; height: 0;"
};

const createIframe = ([body]) => {
  const iframe = createNode(IFRAME_TAG, IFRAME_ATTRS);

  return appendNode(body, iframe);
};

export default ({ logger }) => {
  const destinationsProcessedDeferred = defer();
  const iframePromise = awaitSelector(BODY_TAG).then(createIframe);
  const fireDestinationsPromise = iframePromise.then(iframe => {
    return fireDestinationsFactory({
      iframe,
      logger,
      destinationsProcessedDeferred
    });
  });

  let ended = false;

  const end = () => {
    ended = true;
    iframePromise.then(removeNode);
  };

  const fire = destinations => {
    fireDestinationsPromise.then(fireDests => {
      if (!ended) {
        fireDests(destinations);
      }
    });
  };

  return {
    fire,
    end,
    destinationsProcessedPromise: destinationsProcessedDeferred.promise
  };
};
