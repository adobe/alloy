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
export default class CoreComponents {
  constructor(listOfComponents) {
    this._list = listOfComponents;
  }

  add(component) {
    // TODO: Validate the interface...
    this._list.push(component);
  }

  hasComponent() {}

  getComponent(namespace) {
    return this._list.find(component => component.namespace === namespace);
  }

  // ALL THE LIFECYCLE HOOKS GO HERE!

  onComponentsRegistered(core) {
    // MAYBE: If a Component has a hard dependency, or maybe CORE can do this:
    //if (core.hasComponent('Personalization')) {
    // new Error() or core.missingRequirement('I require Personalization');
    //}
    return this._invokeHook("onComponentsRegistered", core);
  }

  onBeforeInteract(payload) {
    return this._invokeHook("onBeforeInteract", payload);
  }

  onInteractResponse(response) {
    return this._invokeHook("onInteractResponse", response);
  }

  onBeforeCollect(payload) {
    return this._invokeHook("onBeforeCollect", payload);
  }

  onCollectResponse(response) {
    return this._invokeHook("onCollectResponse", response);
  }

  _invokeHook(hook, ...args) {
    return this._list.map(component => {
      if (typeof component[hook] === "function") {
        return component[hook](...args);
      }
    });
  }
}
