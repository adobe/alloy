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

import createConfigValidators from "./createConfigValidators";

const createDataCollector = ({ eventManager }) => {
  return {
    commands: {
      event(options) {
        const {
          xdm,
          data,
          viewStart = false,
          documentUnloading = false
        } = options;
        const event = eventManager.createEvent();

        if (documentUnloading) {
          event.documentUnloading();
        }

        return eventManager.sendEvent(event, {
          isViewStart: viewStart,
          applyUserProvidedData() {
            // We merge the user's data after onBeforeEvent so that
            // it overlays on top of any data Alloy automatically
            // provides. This allows the user to override the
            // automatically collected data.
            event.mergeXdm(xdm);
            event.data = data;
          }
        });
      }
    }
  };
};

createDataCollector.namespace = "DataCollector";
createDataCollector.abbreviation = "DC";
createDataCollector.configValidators = createConfigValidators();

export default createDataCollector;
