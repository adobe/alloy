/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import addRenderAttemptedToDecisions from "./utils/addRenderAttemptedToDecisions";
import isNonEmptyArray from "../../utils/isNonEmptyArray";

const getPropositions = ({ viewCache, viewName, pageWideScopeDecisions }) => {
  if (!viewName) {
    return { pageWideScopeDecisions, viewPropositions: [] };
  }

  return viewCache.getView(viewName).then(viewPropositions => {
    return { pageWideScopeDecisions, viewPropositions };
  });
};

export default ({ viewCache, executeDecisions, showContainers, collect }) => {
  return ({ viewName, pageWideScopeDecisions, nonAutoRenderableDecisions }) => {
    return Promise.resolve(pageWideScopeDecisions)
      .then(propositions =>
        getPropositions({
          viewCache,
          viewName,
          executeDecisions,
          pageWideScopeDecisions: propositions
        })
      )
      .then(propositions => {
        executeDecisions(propositions.pageWideScopeDecisions).then(
          decisionsMeta => {
            if (isNonEmptyArray(decisionsMeta)) {
              collect({ decisionsMeta });
            }
          }
        );

        if (viewName) {
          executeDecisions(propositions.viewPropositions).then(
            decisionsMeta => {
              collect({ decisionsMeta, viewName });
            }
          );
        }

        showContainers();

        return [
          ...propositions.pageWideScopeDecisions,
          ...propositions.viewPropositions
        ];
      })
      .then(renderablePropositions => {
        return {
          decisions: [...nonAutoRenderableDecisions],
          propositions: [
            ...addRenderAttemptedToDecisions({
              decisions: renderablePropositions,
              renderAttempted: true
            }),
            ...addRenderAttemptedToDecisions({
              decisions: nonAutoRenderableDecisions,
              renderAttempted: false
            })
          ]
        };
      });
  };
};
