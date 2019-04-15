import fireDestinations from "./fireDestinations";

function waitForDocumentBody(resolve) {
  if (document.body) {
    resolve();
  } else {
    setTimeout(() => waitForDocumentBody(resolve), 30);
  }
}

function getDocumentBody() {
  return new Promise(resolve => {
    if (document.body) {
      resolve();
    } else {
      waitForDocumentBody(resolve);
    }
  });
}

export default ({ logger }) => {
  function createIframe() {
    return getDocumentBody().then(() => {
      // TODO: Do we inject document or window instead?
      const iframe = document.createElement("iframe");
      iframe.className = "adobe-iframe";
      iframe.name = "Adobe Destinationing iFrame";
      iframe.style.cssText = "display: none; width: 0; height: 0;";
      document.body.appendChild(iframe);

      return iframe;
    });
  }

  const iframePromise = createIframe();

  const fireDestsPromise = iframePromise.then(iframe => {
    return fireDestinations({ iframe, logger });
  });

  let ended = false;

  const end = () => {
    ended = true;
    iframePromise.then(iframe => {
      document.body.removeChild(iframe);
    });
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
