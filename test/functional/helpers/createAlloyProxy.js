import { ClientFunction } from "testcafe";

const proxyFunction = ClientFunction((instanceName, command, options) => {
  return window[instanceName](command, options);
});

const asyncProxyFunction = ClientFunction((instanceName, command, options) => {
  window.lastAlloyProxyPromise = window[instanceName](command, options);
});

const getLastPromise = ClientFunction(() => {
  return window.lastAlloyProxyPromise;
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
      return { promise: getLastPromise() };
    };
  });

  return proxy;
};
