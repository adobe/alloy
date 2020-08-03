import { corsRequest } from "./network/injectSendXhrRequest";

const createResultLogMessage = (scriptUrl, success) => {
  return `Loading script ${success ? "succeeded" : "failed"}: ${scriptUrl}`;
};

const SOLUTION_SCRIPTS = {
  mboxEdit: "http://cdn.tt.omtrdc.net/cdn/target.js"
};

const getExternalScripts = () => {
  let params = document.location.href.split("?");
  if (params.length === 1) {
    return [];
  }
  params = params[1].split("&");
  return params
    .map(param => {
      const paramName = param.split("=")[0];
      return SOLUTION_SCRIPTS[paramName];
    })
    .filter(Boolean);
};

const createScriptRequest = scriptUrl => {
  const options = {
    method: "GET",
    url: scriptUrl
  };
  return corsRequest(window.XMLHttpRequest, options)
    .then(response => {
      const scriptjs = response.body;
      // eslint-disable-next-line no-eval
      window.eval(scriptjs);
      console.log(createResultLogMessage(scriptUrl, true));
    })
    .catch(() => {
      console.error(createResultLogMessage(scriptUrl, false));
    });
};

export default () => {
  const scriptUrls = getExternalScripts();

  if (!scriptUrls.length) {
    return Promise.resolve();
  }

  return Promise.all(
    scriptUrls.map(scriptUrl => createScriptRequest(scriptUrl))
  );
};
