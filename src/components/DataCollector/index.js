import { assign } from "../../utils";
import validateUserEventOptions from "./validateUserEventOptions";

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

import CONFIG_DOC_URI from "../../constants/docUri";

const createDataCollector = ({ eventManager, logger }) => {
  return {
    commands: {
      event(options) {
        const warnings = validateUserEventOptions(options);
        if (warnings.length) {
          logger.warn(
            `Invalid event command options:\n\t - ${warnings.join(
              "\n\t - "
            )}\nFor documentation covering the event command see: ${CONFIG_DOC_URI}`
          );
        }
        let { xdm } = options;
        const {
          data,
          viewStart = false,
          documentUnloading = false,
          type,
          mergeId,
          scopes = []
        } = options;
        const event = eventManager.createEvent();

        if (documentUnloading) {
          event.documentMayUnload();
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

        event.setUserXdm(xdm);
        event.setUserData(data);

        return eventManager.sendEvent(event, {
          isViewStart: viewStart,
          scopes
        });
      }
    }
  };
};

createDataCollector.namespace = "DataCollector";
createDataCollector.configValidators = {};

export default createDataCollector;
