import createDebug from "../../../../src/components/Debug/index.js";

export default ({ addMonitor, storage, window }) => {

  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get("debug");
  const debugEnabledInQuery = debugParam !== "false" && debugParam !== "" && debugParam !== "0";

  const getDebugEnabled = (instanceName) => {
    return debugEnabledInQuery || storage.session.getItem(`${instanceName}.debug`) === "true";
  };
  const setDebugEnabled = (instanceName, value) => {
    storage.session.setItem(`${instanceName}.debug`, value.toString());
  };

  return createDebug({ addMonitor, getDebugEnabled, setDebugEnabled, logger: console });
}
