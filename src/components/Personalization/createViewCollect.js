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
import { DISPLAY } from "./constants/eventType";

export default ({ eventManager, mergeDecisionsMeta }) => {
  // Called when an offer for a specific SPA view is auto-rendered.
  return ({ decisionsMeta, xdm }) => {
    const data = { eventType: DISPLAY };
    const event = eventManager.createEvent();

    if (isNonEmptyArray(decisionsMeta)) {
      const viewName = decisionsMeta[0].scope;

      data.web = {
        webPageDetails: { viewName }
      };

      mergeDecisionsMeta(event, decisionsMeta);
    }
    event.mergeXdm(data);
    event.mergeXdm(xdm);

    return eventManager.sendEvent(event);
  };
};
