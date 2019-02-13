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
//          MAYBE: A component exposes its capabilities, and those are exposed on core.
//      - Option 2: Event system. (Not the best option since it's too decoupled)
//      - Option 3: Explicitly fetch a component from Core and work with it.
//          Example: if (core.hasComponent("foo")) core.getComponent("foo").doSomething();

// Capabilities: Consider something like that: registry.registerCapability("foo", new Foo()); where components can
// add their capabilities to the system. So if Personalization for example wants to expose a `getOffer` capability
// OR: Core.register(component, capabilities): (identity, { "getId": ... })

// TODO: We might need a `CoreConfig` module that encapsulates config stuff like initing, adding to it later on...

import createCoreComponents from "./CoreComponents";
import EventBus from "./EventBus";

function Core(configs, ...components) {
  const events = new EventBus();
  const coreComponents = createCoreComponents(Core.registry.concat(components));
  const tracker = coreComponents.getComponent("Tracker");

  coreComponents.onComponentsRegistered(this);

  Object.defineProperties(this, {
    events: {
      get() {
        return events;
      }
    },
    configs: {
      get() {
        return configs;
      }
    },
    components: {
      get() {
        return coreComponents;
      }
    }
  });

  // Testing how we will expose Components' APIs to main.js and the outside world.
  this.interact = (data, callback) => {
    tracker.interact(data, callback);
  };

  this.collect = (data, callback) => {
    tracker.collect(data, callback);
  };

  this.makeLogger = prefix => ({});
}

// TODO: Might need to make this guy a smart object, not a simple array.
Core.registry = [];
Core.plugins = [];

// TODO: Validate.
Core.registerComponent = component => {
  Core.registry.push(component);
};
Core.registerPlugin = plugin => {
  Core.plugins.push(plugin);
};

export default Core;
