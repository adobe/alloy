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
  buildReturnedDecisions
} from "./handlers/proposition";

export default ({ mergeDecisionsMeta, render, viewCache }) => {
  return ({ personalizationDetails, event, onResponse }) => {
    const viewName = personalizationDetails.getViewName();

    return viewCache.getView(viewName).then(propositions => {
      onResponse(() => {
        return {
          propositions: buildReturnedPropositions(propositions),
          decisions: buildReturnedDecisions(propositions)
        };
      });

      if (personalizationDetails.isRenderDecisions()) {
        return render(propositions).then(decisionsMeta => {
          mergeDecisionsMeta(
            event,
            decisionsMeta,
            PropositionEventType.DISPLAY
          );
        });
      }
      return Promise.resolve();
    });
  };
};
