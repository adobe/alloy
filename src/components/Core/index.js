
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
        
        this.interact = this.interact.bind(this);
        this.collect = this.collect.bind(this);
        this._events = new EventBus();

        this._components.onComponentsRegistered(this);
        this.tracker = this._components.getComponent("Tracker");
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

    get configs() { return this._configs; }

    get events() { return this._events; }

    get components() { return this._components; }

    // Testing how we will expose Components' APIs to main.js and the outside world.
    interact(data, callback) {
        this.tracker.interact(data, callback);
    }

    collect(data, callback) {
        this.tracker.collect(data, callback);
    }
}
