
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

    hasComponent(namespace) {

    }

    getComponent(namespace) {
        return this._list.find(component => component.namespace === namespace);
    }

    // ALL THE LIFECYCLE HOOKS GO HERE!
    // TODO Define the final hooks.

    onInteractRequest(payload) {
        return this._invokeHook("onInteractRequest", payload);
    }

    // MAYBE: A LifeCycle hook once all components have registered?
    // MAYBE: This is an `appReady` hook?
    componentsDidMount(core) {
        //if (core.hasComponent('Personalization')) {
            // new Error() or core.missingRequirement('I require Personalization');
        //}
        return this._invokeHook("componentsDidMount", core);
    }

    willPrepareRequest(payload) {
        return this._invokeHook("willPrepareRequest", payload);
    }

    onResponseReady(response) {
        return this._invokeHook("onResponseReady", response);
    }

    _invokeHook(hook, ...args) {
        return this._list.map(component => {
            if (typeof component[hook] === "function") {
                return component[hook](...args);
            }
        });
    }
}
