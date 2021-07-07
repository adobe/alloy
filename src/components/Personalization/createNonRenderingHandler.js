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

import { DECISIONS_DEPRECATED_WARNING } from "./constants/loggerMessage";
import addRenderAttemptedToDecisions from "./utils/addRenderAttemptedToDecisions";

const getViewPropositions = ({ viewCache, viewName, propositions }) => {
  if (!viewName) {
    return propositions;
  }

  return viewCache
    .getView(viewName)
    .then(viewPropositions => [...viewPropositions, ...propositions]);
};

const buildFinalResult = ({ logger, propositions }) => {
  return {
    get decisions() {
      // Added decisions for backward compatibility.
      logger.warn(DECISIONS_DEPRECATED_WARNING);

      return propositions;
    },
    propositions: addRenderAttemptedToDecisions({
      decisions: propositions,
      renderAttempted: false
    })
  };
};

export default ({ viewCache, logger }) => {
  return ({
    viewName,
    redirectDecisions,
    pageWideScopeDecisions,
    nonAutoRenderableDecisions
  }) => {
    const propositions = [
      ...redirectDecisions,
      ...pageWideScopeDecisions,
      ...nonAutoRenderableDecisions
    ];

    return Promise.resolve(propositions)
      .then(items =>
        getViewPropositions({ viewCache, viewName, propositions: items })
      )
      .then(items => buildFinalResult({ logger, propositions: items }));
  };
};
