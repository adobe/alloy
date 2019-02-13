// Build the Object tree, handle dependencies, reveal the API and wrap it with a
// global facade function; (Maybe adbe or atag...), and that's what get exposed to
// the customer.

import "@adobe/reactor-promise";

import window from "@adobe/reactor-window";

import Core from "./components/Core";

import registerTracker from "./components/Tracker/register";
import registerIdentity from "./components/Identity/register";
import registerAudiences from "./components/Audiences/register";
import registerPersonalization from "./components/Personalization/register";

// TODO: Support multiple cores maybe per ORG ID.
// cores: [{ orgId, instance }...]
let core = null;

// TODO: Look for existing atag (OR adbe) object on the page first.

function atag(command = "collect", { params = {}, callback } = {}) {
  function collect(payload = {}, callback) {
    // TODO Decide on a final format for all Components' APIs: Maybe (requiredParam, { optional params }), or maybe { ALL PARAMS }.
    return core.collect(payload, callback);
  }

  // MAYBE: Since we don't have a data layer yet, should we support a `configs.data`?
  function configure(configs) {
    // For now we are instantiating Core when configure is called.
    // TODO: Maybe pass those configs to a CoreConfig object that validates and wrap the raw configs.
    // TODO: Register the Components here statically for now. They might be registered differently.

    // TODO: Maybe pass Core in.
    registerTracker();
    registerIdentity();
    registerAudiences();
    registerPersonalization();

    core = new Core(configs);

    // TODO: Move this guy out of here.. This is just a quick test for the initial call. We might not even need that.
    if (!configs.disableStartupCall) {
      core.interact(
        {
          event: "page View",
          pageName: "home"
        },
        callback
      );
    }
  }

  function subscribe(params, callback) {}

  const commands = { collect, configure, subscribe };
  commands[command](params, callback);
}

// TODO: @khoury this needs to be fixed,
// `npm test` fails because of this construct

const namespace = window.__adobeNamespace;

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

export default atag;
