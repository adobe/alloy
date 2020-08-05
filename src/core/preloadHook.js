const ALLOW_LIST = [
  "http://localhost.corp.adobe.com:4502",
  "http://experience.adobe.com",
  "https://atag.experiencecloud.adobe.com" // TODO - Target UI all envs incl. shell
];

let preloadListener;

const createResultLogMessage = (origin, success) => {
  return `Loading script from origin ${origin} ${
    success ? "succeeded" : "failed"
  }`;
};

const preloadHookHandler = resolve => {
  const preloadHook = event => {
    if (
      event.data.type !== "preloadHook" ||
      !ALLOW_LIST.includes(event.origin)
    ) {
      return;
    }

    try {
      // eslint-disable-next-line no-eval
      window.eval(event.data.value);
      console.log(createResultLogMessage(event.origin, true));
    } catch (err) {
      console.error(createResultLogMessage(event.origin, false));
    }
    resolve();
  };
  return preloadHook;
};

export const removeListener = () => {
  window.removeEventListener("message", preloadListener);
};

export default () => {
  return new Promise((resolve, reject) => {
    preloadListener = preloadHookHandler(resolve, reject);
    window.addEventListener("message", preloadListener, false);
    window.parent.postMessage("preloadHookReady", "*");
  });
};
