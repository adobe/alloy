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

import { NOT_RENDERED } from "./constants/decisionStatus";

export default ({
  executeCachedViewDecisions,
  viewCache,
  addRenderedDecisionStatus,
  formatDecisions,
  showContainers
}) => {
  return ({ personalizationDetails, onResponse, onRequestFailure }) => {
    const viewName = personalizationDetails.getViewName();
    const executedDecisionsResult = [];
    if (personalizationDetails.isRenderDecisions()) {
      executeCachedViewDecisions({ viewName }).then(result => {
        executedDecisionsResult.push(result);
      });
    }

    onResponse(() => {
      if (personalizationDetails.isRenderDecisions()) {
        return {
          decisions: formatDecisions({ executedDecisionsResult })
        };
      }
      return viewCache.getView(viewName).then(decisions => {
        addRenderedDecisionStatus(decisions, NOT_RENDERED);
        return { decisions };
      });
    });

    onRequestFailure(() => {
      showContainers();
    });
  };
};
