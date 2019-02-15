// - This dude acts as a Components repo.
// - It also implements all of the Core's lifecycle hooks.

// Let's start the first version with an explicit Hook interface,
// and not a random pub/sub model. Meaning each Component will have
// to implement the hook it's interested in as a method on its prototype.

// We will have a Plop helper that generates Components and populate all the
// hooks as Template methods.

// TODO: Finalize the first set of Lifecycle hooks.
// TODO: Support Async hooks. (Or maybe default them as Async)
// TODO: Hooks might have to publish events so the outside world can hooks in as well.

// TODO Maybe rename this to `registry`.

function invokeHook(components, hook, ...args) {
  return components.map(component => {
    return typeof component[hook] === "function"
      ? component[hook](...args)
      : undefined;
  });
}

export default componentRegistry => {
  const components = componentRegistry.getAll();
  return {
    onComponentsRegistered(core) {
      // MAYBE: If a Component has a hard dependency, or maybe CORE can do this:
      // if (core.hasComponent('Personalization')) {
      // new Error() or core.missingRequirement('I require Personalization');
      // }
      return invokeHook(components, "onComponentsRegistered", core);
    },
    onBeforeInteract(payload) {
      return invokeHook(components, "onBeforeInteract", payload);
    },
    onInteractResponse(response) {
      return invokeHook(components, "onInteractResponse", response);
    },
    onBeforeCollect(payload) {
      return invokeHook(componentRegistry.getAll(), "onBeforeCollect", payload);
    },
    onCollectResponse(response) {
      return invokeHook(components, "onCollectResponse", response);
    }
  };
};
