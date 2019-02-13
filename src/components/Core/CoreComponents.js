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

function invokeHook(listOfComponents, hook, ...args) {
  return listOfComponents.map(component => {
    return typeof component[hook] === "function"
      ? component[hook](...args)
      : undefined;
  });
}

export default listOfComponents => {
  return {
    add(component) {
      // TODO: Validate the interface...
      listOfComponents.push(component);
    },
    // hasComponent() {}
    getComponent(namespace) {
      return listOfComponents.find(
        component => component.namespace === namespace
      );
    },
    onComponentsRegistered(core) {
      // MAYBE: If a Component has a hard dependency, or maybe CORE can do this:
      // if (core.hasComponent('Personalization')) {
      // new Error() or core.missingRequirement('I require Personalization');
      // }
      return invokeHook(listOfComponents, "onComponentsRegistered", core);
    },
    onBeforeInteract(payload) {
      return invokeHook(listOfComponents, "onBeforeInteract", payload);
    },
    onInteractResponse(response) {
      return invokeHook(listOfComponents, "onInteractResponse", response);
    },
    onBeforeCollect(payload) {
      return invokeHook(listOfComponents, "onBeforeCollect", payload);
    },
    onCollectResponse(response) {
      return invokeHook(listOfComponents, "onCollectResponse", response);
    }
  };
};
