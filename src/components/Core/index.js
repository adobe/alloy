
// This is the Core Component of the A-Tag.
// It provides the following:
//  - Component system.
//  - Payload object that allows the components to append to the payload to be sent to the gateway.
//  - Plugin system. (Components might be plugins, but build by Adobe)
//  - Event system.
//  - Logging. (core.logger....)
//  - Core Configs.
//  - Cross Components communication: (Not defined yet; we have 3 options, or maybe more)
//      - Option 1: Mediator pattern, where all components go through Core first: Core.execute...
//      - Option 2: Event system. (Not the best option since it's too decoupled)
//      - Option 3: Explicitly fetch a component from Core and work with it.
//          Example: if (core.hasComponent("foo")) core.getComponent("foo").doSomething();
//  - MAYBE a dependency system:
//      - if (core.hasComponent('Personalization')) new Error() or core.missingRequirement('I require Personalization');

// Capabilities: Consider something like that: registry.registerCapability("foo", new Foo()); where components can
// add their capabilities to the system. So if Personalization for example wants to expose a `getOffer` capability


// TODO: We might need a `CoreConfig` module that encapsulates config stuff like initing, adding to it later on...

import Payload from "./Payload";
import CoreComponents from "./CoreComponents";
import EventBus from "../../helpers/EventBus";

// TODO: Might need to make this guy a smart object, not a simple array.
const registry = [];
const plugins = [];

// TODO: Consider using function constructors instead, for minimal transpilation and privacy.
export default class Core {
    constructor(configs, ...components) {
        this._components = new CoreComponents(registry.concat(components));
        this._configs = configs;
        this.collect = this.collect.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this._events = new EventBus();

        this._components.componentsDidMount(this);
    }

    static makeLogger(prefix) {
        return {};
    }

    static registerComponent(component) {
        registry.push(component);
    }

    // TODO: Define a plugin system.
    static registerPlugin(plugin) {
        plugins.push(plugin);
    }

    get configs() {
        return this._configs;
    }

    get events() {
        return this._events;
    }


    // Playing around with a startup call idea.. Or basically page/view load.
    interact(data, callback) {
        this.createRequest(data, this.interactRequestHook.bind(this))
            .then(payload => this.sendRequest("interact", payload))
            // TODO Maybe callback should follow the Node API: (error, data)
            .then(() => callback("Startup call has been fired!"));
    }

    // TODO: Definitely rename :)
    // MAYBE: make this api more specific to being an initial call when a page or view first load.
    // Maybe we need 2 APIs: One that waits for reponse and another that fires and forgets.
    collect(data, callback) {
        this.createRequest(data, this.prepareRequestHook.bind(this))
            .then(payload => this.sendRequest("collect", payload))
            // TODO Maybe callback should follow the Node API: (error, data)
            .then(() => callback("Data has been collected!"));
    }

    prepareRequestHook(payload) {
        this._components.willPrepareRequest(payload);
    }

    interactRequestHook(payload) {
        this._components.onStartupRequest(payload);
    }

    createRequest(data, hook) {
        // Populate the request's body with payload, data and metadata.
        const payload = new Payload({ data });

        // TODO: Make those hook calls Async?
        hook(payload);

        // MAYBE: Not sure how the cross components communication will happen yet.
        const identity = this._components.getComponent("Identity");

        // Append metadata to the payload.
        payload.appendToMetadata({
            ecid: identity.getEcid() || null,
            enableStore: this.configs.shouldStoreCollectedData,
            device: this.configs.device || "UNKNOWN-DEVICE"
        });

        // Append Context data; basically data we can infer from the environment.
        // TODO: take this stuff out of here, and have some helper component do that.
        payload.appendToContext({
            env: {
                "js_enabled": true,
                "js_version": "1.8.5",
                "cookies_enabled": true,
                "browser_height": 900,
                "screen_orientation": "landscape",
                "webgl_renderer": "AMD Radeon Pro 460 OpenGL Engine"
            },
            view: {
                "url": "www.test.com",
                "referrer": "www.adobe.com"
            }            
        });

        return Promise.resolve(payload.toJson());
    }

    // TODO: This is where we go to the Tracker or Request Component.
    sendRequest(endpoint, requestPayload) {
        // MAYBE: Not sure how the cross components communication will happen yet.
        const tracker = this._components.getComponent("Tracker");

        tracker.send(endpoint, requestPayload)
            // Freeze the response before handing it to all the components.
            .then(response => Object.freeze(response.json()))
            .then(respJson => {
                this._components.onResponseReady(respJson);
            });
    }
}
