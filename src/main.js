
// Build the Object tree, handle dependencies, reveal the API and wrap it with a
// global facade function; (Maybe adbe or atag...), and that's what get exposed to
// the customer.

import "@adobe/reactor-promise";

import Core from "./components/Core";

import registerPersonalization from "./components/Personalization/register";
import registerDestinations from "./components/Destinations/register";
import registerIdentity from "./components/Identity/register";
import registerTracker from "./components/Tracker/register";

const noop = () => {};

// TODO: Support multiple cores maybe per ORG ID.
let core = null;

// TODO: Look for existing atag (OR adbe) object on the page first.

function atag(command = "collect", { params = {}, callback = noop } = {}) {

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
        registerPersonalization();
        registerDestinations();
        registerIdentity();
        registerTracker();

        core = new Core(configs);

        // TODO: Move this guy out of here.. This is just a quick test for the initial call. We might not even need that.
        if (!configs.disableStartupCall) {
            core.interact({
                event: "page View",
                pageName: "home"
            }, callback)
        }
    }

    function subscribe(params, callback) {

    }

    const commands = { collect, configure, subscribe };
    commands[command](params, callback);
}

const namespace = window.__adobeNamespace;

if (window[namespace]) {
    const queue = window[namespace].q;
    queue.forEach(queuedArguments => {
        atag(...queuedArguments);
    });
}

window[namespace] = atag;

export default atag;

