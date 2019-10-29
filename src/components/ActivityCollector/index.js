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

import attachClickActivityCollector from "./attachClickActivityCollector";
import createConfigValidators from "./createConfigValidators";
import createLinkClick from "./createLinkClick";

const createActivityCollector = ({ config, eventManager }) => {
  const linkClick = createLinkClick(window, config);

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { lifecycle } = tools;
        attachClickActivityCollector(config, eventManager, lifecycle);
        // TODO: createScrollActivityCollector ...
      },
      onClick({ event, clickedElement }) {
        linkClick(event, clickedElement);
      }
    }
  };
};

createActivityCollector.namespace = "ActivityCollector";
createActivityCollector.abbreviation = "AC";
createActivityCollector.configValidators = createConfigValidators();

export default createActivityCollector;
