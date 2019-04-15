import isObject from "./isObject";
import isNonEmptyString from "./isNonEmptyString";
import fireImageOnPage from "./fireImageOnPage";

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

const fireOnPage = fireImageOnPage;

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

  const fireInIframe = url => {
    if (iframe) {
      if (isNonEmptyString(url)) {
        const img = iframe.contentWindow.document.createElement("img");

        img.src = url;
      }
    }
  };

  const end = () => {
    document.body.removeChild(iframe);
    iframe = null;
  };

  const fire = (destinations = []) => {
    const destinationsQueue = [];

    Array.prototype.push(destinationsQueue, destinations);

    init().then(() => {
      destinations.forEach(dest => {
        if (isObject(dest)) {
          if (isNonEmptyString(dest.url)) {
            const url = new RegExp(
              `^${document.location.protocol}//:`,
              "i"
            ).test(dest.url)
              ? dest.url
              : `${document.location.protocol}//${dest.url}`;

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
    });
  };

  return {
    init,
    fire,
    end
  };
};
