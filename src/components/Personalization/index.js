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

import { isNonEmptyArray } from "../../utils";
import initModules from "./initModules";
import createModuleProvider from "./turbine/createModuleProvider";
import executeRules from "./turbine";

const PAGE_HANDLE = "personalization:page";

const createPersonalization = ({ logger }) => {
  let moduleProvider;

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { componentRegistry } = tools;
        const modules = initModules(componentRegistry);
        moduleProvider = createModuleProvider(modules);
      },
      onBeforeEvent(event, isViewStart) {
        if (!isViewStart) {
          return;
        }

        event.mergeQuery({
          personalization: {
            page: true,
            views: true
          }
        });
      },
      onResponse(response) {
        const fragments = response.getPayloadByType(PAGE_HANDLE) || [];

        fragments.forEach(fragment => {
          const { rules = [] } = fragment;

          if (isNonEmptyArray(rules)) {
            executeRules(rules, moduleProvider, logger);
          }
        });
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

export default createPersonalization;
