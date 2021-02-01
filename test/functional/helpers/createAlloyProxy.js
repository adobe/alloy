import { ClientFunction } from "testcafe";

const proxyFunction = ClientFunction((instanceName, command, options) => {
  return window[instanceName](command, options);
});

const asyncProxyFunction = ClientFunction((instanceName, command, options) => {
  window.lastAlloyProxyPromise = window[instanceName](command, options);
});

const errorMessageProxyFunction = ClientFunction(
  (instanceName, command, options) => {
    return window[instanceName](command, options).then(
      () => undefined,
      e => e.message
    );
  }
);

const getLastPromise = ClientFunction(() => {
  return window.lastAlloyProxyPromise;
});

const getLastErrorMessage = ClientFunction(() => {
  return window.lastAlloyProxyPromise.then(() => undefined, e => e.message);
});

const commands = [
  "configure",
  "sendEvent",
  "setConsent",
  "getIdentity",
  "setDebug",
  "getLibraryInfo"
];

export default instanceName => {
  const proxy = {};
  commands.forEach(command => {
    proxy[command] = options => proxyFunction(instanceName, command, options);
    proxy[`${command}Async`] = async options => {
      await asyncProxyFunction(instanceName, command, options);
      return { promise: getLastPromise(), errorMessage: getLastErrorMessage() };
    };
    proxy[`${command}ErrorMessage`] = options =>
      errorMessageProxyFunction(instanceName, command, options);
  });

  return proxy;
};
