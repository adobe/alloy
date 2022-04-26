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
import isObject from "../../utils/isObject";

export const EMPTY_PROPOSITIONS = { propositions: [] };

export default ({ viewCache, executeDecisions, showContainers }) => {
  const preparePropositions = ({ propositions, metadata }) => {
    if (!isObject(metadata)) {
      return Promise.resolve(propositions);
    }

    return Promise.resolve(
      propositions.map(proposition => {
        const completeProposition = { ...proposition };
        if (
          isObject(metadata[completeProposition.scope]) &&
          isNonEmptyArray(completeProposition.items)
        ) {
          const metadataForScope = metadata[completeProposition.scope];
          completeProposition.items.forEach(item => {
            item.data.selector = metadataForScope.selector;
            item.data.type = metadataForScope.actionType;
          });
        }
        return completeProposition;
      })
    );
  };

  const applyPropositions = ({ propositions, metadata }) => {
    return preparePropositions({ propositions, metadata })
      .then(completePropositions => executeDecisions(completePropositions))
      .then(() => {
        showContainers();
        return composePersonalizationResultingObject(propositions, true);
      });
  };

  return ({ propositions, viewName, metadata }) => {
    if (isNonEmptyArray(propositions)) {
      return Promise.resolve(applyPropositions({ propositions, metadata }));
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
