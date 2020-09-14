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

import { isNonEmptyArray, assign } from "../../utils";

export default ({ eventManager, mergeMeta }) => {
  return (meta, xdm = {}) => {
    const { decisions = [] } = meta;
    const data = { eventType: "display" };
    const event = eventManager.createEvent();

    if (isNonEmptyArray(decisions)) {
      const viewName = decisions[0].scope;

      data.web = {
        webPageDetails: { viewName }
      };

      mergeMeta(event, meta);
    }

    event.mergeXdm(assign(data, xdm));

    return eventManager.sendEvent(event);
  };
};
