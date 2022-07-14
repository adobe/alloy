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

import { isNonEmptyArray } from "../../utils";
import { INTERACT } from "./constants/eventType";
import PAGE_WIDE_SCOPE from "./constants/scope";

export default ({
  mergeDecisionsMeta,
  collectClicks,
  getClickSelectors,
  getClickMetasBySelector
}) => {
  // Called when an element qualifying for conversion within an offer is clicked.
  return ({ event, clickedElement }) => {
    const selectors = getClickSelectors();
    if (isNonEmptyArray(selectors)) {
      const decisionsMeta = collectClicks(
        clickedElement,
        selectors,
        getClickMetasBySelector
      );

      if (isNonEmptyArray(decisionsMeta)) {
        const xdm = { eventType: INTERACT };
        const scope = decisionsMeta[0].scope;

        if (scope !== PAGE_WIDE_SCOPE) {
          xdm.web = {
            webPageDetails: {
              viewName: scope
            }
          };
        }
        // TODO: move this in attachClickActivityCollector get link details here and determine whether should set use beacon
        event.documentMayUnload(); // this is needed in case it is an exit link and but clickCollection is disabled

        event.mergeXdm(xdm);
        mergeDecisionsMeta(event, decisionsMeta);
      }
    }
  };
};
