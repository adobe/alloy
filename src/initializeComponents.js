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

import createComponentRegistry from "./createComponentRegistry";
import createLogger from "./createLogger";
import createTracker from "./components/Tracker";
import createIdentity from "./components/Identity";
import createAudiences from "./components/Audiences";
import createPersonalization from "./components/Personalization";
import createContext from "./components/Context";
import createLifecycle from "./createLifecycle";

// TODO: Register the Components here statically for now. They might be registered differently.
const componentCreators = [
  createTracker,
  createIdentity,
  createAudiences,
  createPersonalization,
  createContext
];

export default (config, debugController) => {
  const componentRegistry = createComponentRegistry();

  componentCreators.forEach(createComponent => {
    const { namespace } = createComponent;
    const logger = createLogger(debugController, namespace);
    const component = createComponent({
      logger,
      config
    });
    componentRegistry.register(namespace, component);
  });

  const lifecycle = createLifecycle(componentRegistry);
  lifecycle.onComponentsRegistered({
    componentRegistry,
    lifecycle
  });

  return componentRegistry;
};
