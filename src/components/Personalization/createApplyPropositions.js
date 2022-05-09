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
import isEmptyObject from "../../utils/isEmptyObject";
import isObject from "../../utils/isObject";

export const EMPTY_PROPOSITIONS = { propositions: [] };
export const HTML_CONTENT_ITEM = "html-content-item";
export const DEFAULT_METADATA = {
  selector: "head",
  type: "appendHtml"
};

export default ({ executeDecisions, showContainers }) => {
  const updatePropositions = ({ proposition, metadataForScope }) => {
    proposition.items.forEach(item => {
      if (item.schema.includes(HTML_CONTENT_ITEM)) {
        item.data.selector =
          metadataForScope.selector || DEFAULT_METADATA.selector;
        item.data.type = metadataForScope.actionType || DEFAULT_METADATA.type;
      }
    });
    return proposition;
  };

  const preparePropositions = ({ propositions, metadata }) => {
    return Promise.resolve(
      propositions.map(proposition => {
        const completeProposition = { ...proposition };
        if (isNonEmptyArray(completeProposition.items)) {
          const metadataForScope =
            !isEmptyObject(metadata) &&
            isObject(metadata[completeProposition.scope])
              ? metadata[completeProposition.scope]
              : DEFAULT_METADATA;
          return updatePropositions({
            proposition: completeProposition,
            metadataForScope
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
        propositions.forEach(proposition => delete proposition.renderAttempted);
        return composePersonalizationResultingObject(propositions, true);
      });
  };

  return ({ propositions, metadata = {} }) => {
    if (isNonEmptyArray(propositions)) {
      return Promise.resolve(applyPropositions({ propositions, metadata }));
    }
    return Promise.resolve(EMPTY_PROPOSITIONS);
  };
};
