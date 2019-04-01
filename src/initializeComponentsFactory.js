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
import createLifecycle from "./createLifecycle";
import getNamespacedStorage from "./utils/getNamespacedStorage";

export default (componentCreators, logger) => config => {
  const componentRegistry = createComponentRegistry();

  componentCreators.forEach(createComponent => {
    const { namespace } = createComponent;
    const storage = getNamespacedStorage(
      "orgId." // TODO: Make orgId mandatory and add it here
    );
    // TO-DOCUMENT: Helpers that we inject into factories.
    const component = createComponent({
      logger,
      config,
      storage
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
