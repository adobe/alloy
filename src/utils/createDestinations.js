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
  let iframe = null;

  function createIframe() {
    if (iframe) {
      return;
    }

    // TODO: Do we inject document or window instead?
    iframe = document.createElement("iframe");
    iframe.className = "adobe-iframe";
    iframe.name = "Adobe Destinationing iFrame";
    iframe.style.cssText = "display: none; width: 0; height: 0;";
    document.body.appendChild(iframe);
  }

  const init = () => {
    return new Promise(resolve => {
      return getDocumentBody().then(() => {
        createIframe();
        resolve();
      });
    });
  };

  const end = () => {
    document.body.removeChild(iframe);
    iframe = null;
  };

  const destinationsQueue = [];

  const fire = (destinations = []) => {
    destinationsQueue.push(...destinations);

    init().then(() => {
      const fireDests = fireDestinations({ iframe, logger });
      fireDests(destinationsQueue);
    });
  };

  return {
    init,
    fire,
    end
  };
};
