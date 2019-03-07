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

import mitt from "mitt";
import createLifecycle from "./createLifecycle";

export default (configs, componentRegistry) => {
  // TODO: Might need to make this guy a smart object, not a simple array.
  const events = mitt();
  const lifecycle = createLifecycle(componentRegistry);

  const core = {
    get events() {
      return events;
    },
    get configs() {
      return configs;
    },
    get components() {
      return componentRegistry;
    },
    get lifecycle() {
      return lifecycle;
    },
    makeLogger(prefix) {
      console.log(prefix);
    }
  };

  lifecycle.onComponentsRegistered(core);

  return core;
};
