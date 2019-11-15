import { assign } from "../../utils";

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

const createDataCollector = ({ eventManager }) => {
  return {
    commands: {
      event(options) {
        let { xdm } = options;
        const {
          data,
          viewStart = false,
          documentUnloading = false,
          type,
          mergeId
        } = options;
        const event = eventManager.createEvent();

        if (documentUnloading) {
          event.documentUnloading();
        }

        if (type || mergeId) {
          xdm = Object(xdm);
        }

        if (type) {
          assign(xdm, { eventType: type });
        }

        if (mergeId) {
          assign(xdm, { eventMergeId: mergeId });
        }

        event.userXdm = xdm;
        event.userData = data;

        return eventManager.sendEvent(event, {
          isViewStart: viewStart
        });
      }
    }
  };
};

createDataCollector.namespace = "DataCollector";
createDataCollector.abbreviation = "DC";
createDataCollector.configValidators = {};

export default createDataCollector;
