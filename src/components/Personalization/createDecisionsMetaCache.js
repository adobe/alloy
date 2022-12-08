/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { isNonEmptyArray, defer } from "../../utils";
import { PropositionEventType } from "./constants/propositionEventType";

export default ({ mergeDecisionsMeta }) => {
  let resolve;
  let promise;
  let items = [];
  return {
    hold({ decisionsMeta, viewName }) {
      items.push({ decisionsMeta, viewName });
      promise = null;
      resolve();
    },
    // called for sendEvent
    flushToEvent(event) {
      if (promise) {
        promise = promise.then(() => {
          items.forEach(({ decisionsMeta, viewName }) => {
            if (isNonEmptyArray(decisionsMeta)) {
              mergeDecisionsMeta(
                event,
                decisionsMeta,
                PropositionEventType.DISPLAY
              );
            }
            if (viewName) {
              // TODO: possibly add this viewName logic to mergeDecisionsMeta
              event.mergeXdm({ web: { webPageDetails: { viewName } } });
            }
          });
          items = [];
        });
      }
      return promise;
    },
    // called for fetch
    expectDecisionsMeta() {
      if (!promise) {
        ({ resolve, promise } = defer());
      }
    }
  };
};
