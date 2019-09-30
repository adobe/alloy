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

import { stackError } from "../utils";

export default ({
  config,
  componentCreators,
  lifecycle,
  componentRegistry,
  tools,
  optIn
}) => {
  const configuredTools = Object.keys(tools).reduce((accumulator, toolKey) => {
    accumulator[toolKey] = tools[toolKey](config);
    return accumulator;
  }, {});

  componentCreators.forEach(createComponent => {
    const { namespace } = createComponent;
    const componentTools = Object.keys(configuredTools).reduce(
      (accumulator, toolKey) => {
        accumulator[toolKey] = configuredTools[toolKey](createComponent);
        return accumulator;
      },
      {}
    );
    // TO-DOCUMENT: Helpers that we inject into factories.
    let component;
    try {
      component = createComponent(componentTools);
    } catch (error) {
      throw stackError(
        `[${namespace}] An error occurred during component creation.`,
        error
      );
    }
    componentRegistry.register(namespace, component);
  });

  return lifecycle
    .onComponentsRegistered({
      componentRegistry,
      lifecycle,
      optIn
    })
    .then(() => componentRegistry);
};
