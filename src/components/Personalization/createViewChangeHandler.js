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

import composePersonalizationResultingObject from "./utils/composePersonalizationResultingObject";
import { isNonEmptyArray } from "../../utils";

export default ({ mergeDecisionsMeta, executeDecisions, viewCache }) => {
  return ({ personalizationDetails, event, onResponse }) => {
    const viewName = personalizationDetails.getViewName();

    return viewCache.getView(viewName).then(viewDecisions => {
      if (personalizationDetails.isRenderDecisions()) {
        return executeDecisions(viewDecisions).then(decisionsMeta => {
          // if there are decisions to be rendered we render them and attach the result in experience.decisions.propositions
          if (isNonEmptyArray(decisionsMeta)) {
            mergeDecisionsMeta(event, decisionsMeta);
            onResponse(() => {
              return composePersonalizationResultingObject(viewDecisions, true);
            });
            return;
          }
          // if there are no decisions in cache for this view, we will merge the events.
          onResponse(() => {
            return composePersonalizationResultingObject(viewDecisions, true);
          });
        });
      }

      onResponse(() => {
        return composePersonalizationResultingObject(viewDecisions, false);
      });
      return {};
    });
  };
};
