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

import Promise from "@adobe/reactor-promise";
import createResponse from "./createResponse";

function invokeHook(components, hook, ...args) {
  return Promise.all(
    components.map(component => {
      // TODO Maybe add a smarter check here to help Components' developers
      // know that their hooks should be organized under `lifecycle`.
      // Maybe check if hook exist directly on the instance, throw.
      let promise;

      if (
        component.lifecycle &&
        typeof component.lifecycle[hook] === "function"
      ) {
        promise = new Promise(resolve => {
          resolve(component.lifecycle[hook](...args));
        });
      }

      return promise;
    })
  );
}

/**
 * This ensures that if a component's lifecycle method X
 * attempts to execute lifecycle method Y, that all X methods on all components
 * will have been called before any of their Y methods are called.
 * @returns {function}
 */
const guardLifecycleMethod = fn => {
  return (...args) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(fn(...args));
      });
    });
  };
};

export default componentRegistry => {
  let components;

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
      components = componentRegistry.getAll();
      return invokeHook(components, "onComponentsRegistered", tools);
    },
    onBeforeViewStart: guardLifecycleMethod(payload => {
      return invokeHook(components, "onBeforeViewStart", payload);
    }),
    onViewStartResponse: guardLifecycleMethod(response => {
      return invokeHook(
        components,
        "onViewStartResponse",
        createResponse(response)
      );
    }),
    onBeforeEvent: guardLifecycleMethod(payload => {
      return invokeHook(components, "onBeforeEvent", payload);
    }),
    onEventResponse: guardLifecycleMethod(response => {
      return invokeHook(
        components,
        "onEventResponse",
        createResponse(response)
      );
    }),
    onBeforeUnload: guardLifecycleMethod(() => {
      return invokeHook(components, "onBeforeUnload");
    }),
    onOptInChanged: guardLifecycleMethod(permissions => {
      return invokeHook(components, "onOptInChanged", permissions);
    })
    // TODO: We might need an `onError(error)` hook.
  };
};
