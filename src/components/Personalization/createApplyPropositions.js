/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import composePersonalizationResultingObject from "./utils/composePersonalizationResultingObject";
import isNonEmptyArray from "../../utils/isNonEmptyArray";
import isNonEmptyString from "../../utils/isNonEmptyString";

const EMPTY_PROPOSITIONS = { propositions: [] };

export default ({ viewCache, executeDecisions, showContainers }) => {
  const applyPropositions = ({ propositions }) => {
    return executeDecisions(propositions).then(() => {
      showContainers();
      return composePersonalizationResultingObject(propositions, true);
    });
  };

  return ({ propositions, viewName }) => {
    if (isNonEmptyArray(propositions)) {
      return Promise.resolve(applyPropositions({ propositions }));
    }
    if (isNonEmptyString(viewName)) {
      return viewCache.getView(viewName).then(viewPropositions =>
        applyPropositions({
          propositions: viewPropositions
        })
      );
    }
    return Promise.resolve(EMPTY_PROPOSITIONS);
  };
};
