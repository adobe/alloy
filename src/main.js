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

// Build the Object tree, handle dependencies, reveal the API and wrap it with a
// global facade function; (Maybe adbe or atag...), and that's what get exposed to
// the customer.

import "@adobe/reactor-promise";

import window from "@adobe/reactor-window";

import createCore from "./components/Core";

import createTracker from "./components/Tracker";
import createIdentity from "./components/Identity";
import createAudiences from "./components/Audiences";
import createPersonalization from "./components/Personalization";
import createComponentRegistry from "./components/Core/createComponentRegistry";

// TODO: Support multiple cores maybe per ORG ID.
// cores: [{ orgId, instance }...]
let core = null;

// eslint-disable-next-line no-underscore-dangle
const namespace = window.__adobeNamespace;

// TODO: Look for existing atag (OR adbe) object on the page first.

// MAYBE: Since we don't have a data layer yet, should we support a `configs.data`?
function configure(configs) {
  // For now we are instantiating Core when configure is called.
  // TODO: Maybe pass those configs to a CoreConfig object that validates and wrap the raw configs.
  // TODO: Register the Components here statically for now. They might be registered differently.

  const componentRegistry = createComponentRegistry();

  componentRegistry.register(createTracker());
  componentRegistry.register(createIdentity());
  componentRegistry.register(createAudiences());
  componentRegistry.register(createPersonalization());

  core = createCore(configs, componentRegistry);
}

// TODO: Replace with util once ready.
const isFunction = arg => typeof arg === "function";

function atag(commandName, options = {}) {
  if (commandName === "configure") {
    configure(options);
    return;
  }

  if (!core) {
    throw new Error(
      `${namespace}: Please configure the library by calling ${namespace}("configure", {...}).`
    );
  }

  const command = core.components.getCommand(commandName);

  if (isFunction(command)) {
    // TODO: Let's discuss calling the callback here instead of passing it around.
    // { callback = noop, ...args }
    command(options);
  } else {
    // TODO: Replace with real logger.
    console.warn(`The command: ${commandName} does not exist!`);
  }
}

function replaceQueue() {
  if (namespace) {
    const queue = window[namespace].q;
    queue.push = atag;
    queue.forEach(queuedArguments => {
      atag(...queuedArguments);
    });
  } else {
    // TODO: Improve error message once we give a name to this library.
    console.error("Incorrectly configured.");
  }
}

replaceQueue();
export default atag;
