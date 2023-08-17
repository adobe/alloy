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

import { PropositionEventType } from "./constants/propositionEventType";
import {
  buildReturnedPropositions,
  buildReturnedDecisions,
  createProposition
} from "./handlers/proposition";

export default ({ mergeDecisionsMeta, render, viewCache }) => {
  return async ({ personalizationDetails, event, onResponse }) => {
    const viewName = personalizationDetails.getViewName();

    const viewHandles = await viewCache.getView(viewName);
    const propositions = viewHandles.map(createProposition);

    if (personalizationDetails.isRenderDecisions()) {
      const decisionsMeta = await render(propositions);
      mergeDecisionsMeta(event, decisionsMeta, PropositionEventType.DISPLAY);
    }
    onResponse(() => {
      return {
        propositions: buildReturnedPropositions(propositions),
        decisions: buildReturnedDecisions(propositions)
      };
    });
    /*
      if (personalizationDetails.isRenderDecisions()) {
        return executeDecisions(viewDecisions).then(decisionsMeta => {
          // if there are decisions to be rendered we render them and attach the result in experience.decisions.propositions
          if (isNonEmptyArray(decisionsMeta)) {
            mergeDecisionsMeta(
              event,
              decisionsMeta,
              PropositionEventType.DISPLAY
            );
            onResponse(() => {
              return composePersonalizationResultingObject(viewDecisions, true);
            });
            return;
          }
          // if there are no decisions in cache for this view, we will send a empty notification
          onResponse(() => {
            collect({ decisionsMeta: [], viewName });
            return composePersonalizationResultingObject(viewDecisions, true);
          });
        });
      }

      onResponse(() => {
        return composePersonalizationResultingObject(viewDecisions, false);
      });
      return {};
    });
*/
  };
};
