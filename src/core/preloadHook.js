import loadScript from "@adobe/reactor-load-script";

// TODO
const ALLOW_LIST = [
  "http://localhost.corp.adobe.com:4502",
  "http://experience.adobe.com",
  "https://atag.experiencecloud.adobe.com"
];

let preloadListener;

const createResultLogMessage = (origin, success) => {
  return `Loading script from origin ${origin} ${
    success ? "succeeded" : "failed"
  }`;
};

const getPreloadEventListener = resolve => {
  const preloadEventListener = event => {
    if (
      event.data.type !== "preloadHook" ||
      !ALLOW_LIST.includes(event.origin)
    ) {
      return;
    }

    loadScript(event.data.url)
      .then(() => {
        console.log(createResultLogMessage(event.origin, true));
        resolve();
      })
      .catch(() => {
        console.error(createResultLogMessage(event.origin, false));
        resolve();
      });
  };
  return preloadEventListener;
};

export const removeListener = () => {
  window.removeEventListener("message", preloadListener);
};

export default () => {
  return new Promise(resolve => {
    preloadListener = getPreloadEventListener(resolve);
    window.addEventListener("message", preloadListener, false);
    window.parent.postMessage("preloadHookReady", "*");
  });
};
