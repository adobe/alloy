// Build the Object tree, handle dependencies, reveal the API and wrap it with a
// global facade function; (Maybe adbe or atag...), and that's what get exposed to
// the customer.

import "@adobe/reactor-promise";

import window from "@adobe/reactor-window";

import createCore from "./components/Core";

import createTracker from "./components/Tracker";
import createIdentity from "./components/Identity";
import createAudiences from "./components/Audiences";
import createPersonalization from "./components/Personalization";
import createComponentRegistry from "./components/Core/createComponentRegistry";

// TODO: Support multiple cores maybe per ORG ID.
// cores: [{ orgId, instance }...]
let core = null;

// eslint-disable-next-line no-underscore-dangle
const namespace = window.__adobeNamespace;

// TODO: Look for existing atag (OR adbe) object on the page first.

// MAYBE: Since we don't have a data layer yet, should we support a `configs.data`?
function configure(configs) {
  // For now we are instantiating Core when configure is called.
  // TODO: Maybe pass those configs to a CoreConfig object that validates and wrap the raw configs.
  // TODO: Register the Components here statically for now. They might be registered differently.

  const componentRegistry = createComponentRegistry();

  componentRegistry.register(createTracker());
  componentRegistry.register(createIdentity());
  componentRegistry.register(createAudiences());
  componentRegistry.register(createPersonalization());

  core = createCore(configs, componentRegistry);
}

function atag(commandName, { params = {}, callback } = {}) {
  if (commandName === "configure") {
    configure(params);
    return;
  }

  if (!core) {
    throw new Error(
      `${namespace}: Please configure the library by calling ${namespace}("configure", {...}).`
    );
  }

  const command = core.components.findComand(commandName);

  // TODO: Replace with util once ready.
  if (typeof command === "function") {
    command(params, callback);
  } else {
    // TODO: Replace with real logger.
    console.warn(`The command: ${commandName} does not exist!`);
  }
}

function replaceQueue() {
  if (namespace) {
    const queue = window[namespace].q;
    queue.push = atag;
    queue.forEach(queuedArguments => {
      atag(...queuedArguments);
    });
  } else {
    // TODO: Improve error message once we give a name to this library.
    console.error("Incorrectly configured.");
  }
}

replaceQueue();
export default atag;
