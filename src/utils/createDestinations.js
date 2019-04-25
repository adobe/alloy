import { awaitSelector, createNode, appendNode, removeNode } from "./dom";
import fireDestinationsFactory from "./fireDestinationsFactory";

const BODY_TAG = "BODY";
const IFRAME_TAG = "IFRAME";
const IFRAME_ATTRS = {
  name: "Adobe Destinationing iFrame",
  class: "adobe-iframe",
  style: "display: none; width: 0; height: 0;"
};

function createPair(body) {
  const iframe = createNode(IFRAME_TAG, IFRAME_ATTRS);

  return { body, iframe: appendNode(body, iframe) };
}

function cleanUp(pair) {
  const { body, iframe } = pair;

  removeNode(body, iframe);
}

export default ({ logger }) => {
  const pairPromise = awaitSelector(BODY_TAG).then(createPair);
  const fireDestsPromise = pairPromise.then(({ iframe }) => {
    return fireDestinationsFactory({ iframe, logger });
  });

  let ended = false;

  const end = () => {
    ended = true;

    pairPromise.then(cleanUp);
  };

  const fire = destinations => {
    fireDestsPromise.then(fireDests => {
      if (!ended) {
        fireDests(destinations);
      }
    });
  };

  return {
    fire,
    end
  };
};
