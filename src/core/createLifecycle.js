/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// - It implements all lifecycle hooks.

// Let's start the first version with an explicit Hook interface,
// and not a random pub/sub model. Meaning each Component will have
// to implement the hook it's interested in as a method on its prototype.

// We will have a Plop helper that generates Components and populate all the
// hooks as Template methods.

// TODO: Finalize the first set of Lifecycle hooks. (DONE)
// TODO: Support Async hooks. (Or maybe default them as Async)
// TODO: Hooks might have to publish events so the outside world can hooks in as well.

// MAYBE: If a Component has a hard dependency, maybe throw an error somewhere:
// if (componentRegistry.hasComponent('Personalization')) {
//  new Error() or core.missingRequirement('I require Personalization');
// }

const invokeHook = (componentRegistry, hookName, ...args) => {
  return Promise.all(
    componentRegistry.getLifecycleCallbacks(hookName).map(callback => {
      return new Promise(resolve => {
        resolve(callback(...args));
      });
    })
  );
};

/**
 * This ensures that if a component's lifecycle method X
 * attempts to execute lifecycle method Y, that all X methods on all components
 * will have been called before any of their Y methods are called. It does
 * this by kicking the call to the Y method to the next JavaScript tick.
 * @returns {function}
 */
const guardLifecycleMethod = fn => {
  return (...args) => {
    return Promise.resolve().then(() => {
      return fn(...args);
    });
  };
};

// TO-DOCUMENT: Lifecycle hooks and their params.
export default componentRegistry => {
  return {
    // We intentionally don't guard onComponentsRegistered. When the user
    // configures the SDK, we need onComponentsRegistered on each component
    // to be executed synchronously (they would be run asynchronously if
    // this method were guarded due to how the guard works) so that if the
    // user immediately executes a command right after configuration,
    // all the components will have already had their onComponentsRegistered
    // called and be ready to handle the command. At the moment, commands
    // are always executed synchronously.
    onComponentsRegistered: tools => {
      return invokeHook(componentRegistry, "onComponentsRegistered", tools);
    },
    onBeforeEvent: guardLifecycleMethod((event, isViewStart) => {
      return invokeHook(componentRegistry, "onBeforeEvent", event, isViewStart);
    }),
    onResponse: guardLifecycleMethod(response => {
      return invokeHook(componentRegistry, "onResponse", response);
    }),
    onBeforeUnload: guardLifecycleMethod(() => {
      return invokeHook(componentRegistry, "onBeforeUnload");
    }),
    onOptInChanged: guardLifecycleMethod(permissions => {
      return invokeHook(componentRegistry, "onOptInChanged", permissions);
    }),
    onBeforeSend: guardLifecycleMethod(request => {
      return invokeHook(componentRegistry, "onBeforeSend", request);
    })
    // TODO: We might need an `onError(error)` hook.
  };
};
