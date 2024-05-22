/*
 * Using TestCafe, the test code is run inside Node. If you want to run code inside the browser
 * you have to use ClientFunctions or t.eval. TestCafe compiles and copies the code inside the
 * ClientFunction or eval onto the browser page and then runs it. TestCafe also has a system for
 * taking the return value and bringing (marshalling) it into Node.
 *
 * There are a few gotchas when using ClientFunction and t.eval with promises. First, promises are
 * only marshalled when they are the only thing returned from the client function. If a promise is
 * included as part of a returned object, the promise isn't marshalled correctly. Secondly, if you
 * do not `await` the ClientFunction execution in the test, client functions may be executed out
 * of order. Lastly, if an error is thrown on the browser inside the returned promise, the error is
 * wrapped in a TestCafe error object. It is easier to get the error information if you catch the
 * error inside the browser. Using this Alloy proxy avoids these pitfalls.
 *
 * To create a proxy, call the default export of this file like this:
 *
 * const alloy = createAlloyProxy();
 *
 * You can pass in the name of the Alloy global variable if needed (it defaults to "alloy".)
 *
 * const instance2 = createAlloyProxy("instance2");
 *
 * All the Alloy commands are implemented as methods on the returned proxy object. They return a
 * marshalled promise from the Alloy command. Be sure to always use "await" when calling any method
 * on the proxy.
 *
 * await alloy.configure(config);
 * await alloy.sendEvent({ renderDecisions: true });
 *
 * Additionally each command has a xxxErrorMessage variant that returns a promise that will resolve
 * with undefined if there was no error, and the error message if there was an error.
 *
 * const errorMessage = await alloy.sendEventErrorMessage();
 * await t.expect(errorMessage).ok("Expected an error, but didn't get one");
 * await t.expect(errorMessage).contains("myerror");
 *
 * Sometimes in a test you need to run other commands before a command finishes. For example, sending an
 * event may not resolve until after consent is given. For these cases, each command has a xxxAsync variant
 * that returns an object with two promises: "result", and "errorMessage". Both of these promises resolve
 * when the command is finished. "result" will resolve to the result of the command, and errorMessage will
 * resolve with undefined if there was no error, and the error message if there was an error.
 *
 * const sendEventResponse = await alloy.sendEventAsync();
 * await alloy.setConsent(...);
 * await sendEventResponse.result;
 *
 */
import { ClientFunction } from "testcafe";

const proxyFunction = ClientFunction((instanceName, command, options) => {
  // return the promise from the client function
  return window[instanceName](command, options);
});

const asyncProxyFunction = ClientFunction((instanceName, command, options) => {
  // save the promise to a browser global variable to be referenced later
  window.lastAlloyProxyPromise = window[instanceName](command, options);
});

const errorMessageProxyFunction = ClientFunction(
  (instanceName, command, options) => {
    // return a promise that resolves to the error message or undefined
    return window[instanceName](command, options).then(
      () => undefined,
      (e) => e.message,
    );
  },
);

const getLastPromise = ClientFunction(() => {
  // fetch the last promise set by asyncProxyFunction
  return window.lastAlloyProxyPromise;
});

const getLastErrorMessage = ClientFunction(() => {
  // return a promise that resolves to the error message or undefined
  // using the last promise set by asyncProxyFunction
  return window.lastAlloyProxyPromise.then(
    () => undefined,
    (e) => e.message,
  );
});

const commands = [
  "configure",
  "sendEvent",
  "applyResponse",
  "setConsent",
  "getIdentity",
  "setDebug",
  "getLibraryInfo",
  "appendIdentityToUrl",
  "applyPropositions",
  "subscribeRulesetItems",
  "evaluateRulesets",
  "createMediaSession",
  "sendMediaEvent",
  "getMediaAnalyticsTracker",
  "subscribeContentCards",
];

export default (instanceName = "alloy") => {
  const proxy = {};
  commands.forEach((command) => {
    // Run the command and return the result.
    proxy[command] = (options) => proxyFunction(instanceName, command, options);

    // Run the command and return the error message or undefined.
    proxy[`${command}ErrorMessage`] = (options) =>
      errorMessageProxyFunction(instanceName, command, options);

    // Run the command, but don't wait on the result.
    proxy[`${command}Async`] = async (options) => {
      // This command calls three separate ClientFunctions to get three promises:
      // 1. We await on the TestCafe generated promise from running the client function.
      //    This ensures that commands are run in order
      // 2. We get the promise from the command that will resolve to the result.
      // 3. We get the error message from the command if there is one.
      await asyncProxyFunction(instanceName, command, options);
      return { result: getLastPromise(), errorMessage: getLastErrorMessage() };
    };
  });

  return proxy;
};
