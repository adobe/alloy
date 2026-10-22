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

import { stackError } from "../utils/index.js";
import type { ComponentRegistry } from "./createComponentRegistry.js";
import type { Lifecycle } from "./createLifecycle.js";
import type { Component, ComponentCreator } from "./types.js";

export interface InitializeComponentsOptions {
  componentCreators: ComponentCreator[];
  lifecycle: Lifecycle;
  componentRegistry: ComponentRegistry;
  getImmediatelyAvailableTools: (componentName: string) => unknown;
}

export default ({
  componentCreators,
  lifecycle,
  componentRegistry,
  getImmediatelyAvailableTools,
}: InitializeComponentsOptions): Promise<ComponentRegistry> => {
  componentCreators.forEach((createComponent) => {
    const { namespace } = createComponent;
    // TO-DOCUMENT: Helpers that we inject into factories.
    const tools = getImmediatelyAvailableTools(namespace);
    let component: Component;
    try {
      // Each component types its own tools.
      component = createComponent(tools as never);
    } catch (error) {
      throw stackError({
        error,
        message: `[${namespace}] An error occurred during component creation.`,
      });
    }
    componentRegistry.register(namespace, component);
  });

  return lifecycle
    .onComponentsRegistered({
      lifecycle,
    })
    .then(() => componentRegistry);
};
