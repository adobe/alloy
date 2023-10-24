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

import { isNonEmptyArray, isObject, defer } from "../../utils";
import { DOM_ACTION, HTML_CONTENT_ITEM } from "./constants/schema";
import PAGE_WIDE_SCOPE from "../../constants/pageWideScope";

const SUPPORTED_SCHEMAS = [DOM_ACTION, HTML_CONTENT_ITEM];

export default ({
  processPropositions,
  createProposition,
  renderedPropositions,
  viewCache
}) => {
  const filterItemsPredicate = item =>
    SUPPORTED_SCHEMAS.indexOf(item.schema) > -1;

  const updatePropositionItems = ({ items, metadataForScope }) => {
    return items
      .filter(filterItemsPredicate)
      .map(item => {
        if (item.schema !== HTML_CONTENT_ITEM) {
          return { ...item };
        }
        if (isObject(metadataForScope)) {
          return {
            ...item,
            data: {
              ...item.data,
              selector: metadataForScope.selector,
              type: metadataForScope.actionType
            }
          };
        }
        return undefined;
      })
      .filter(item => item);
  };

  const filterPropositionsPredicate = proposition => {
    return !(
      proposition.scope === PAGE_WIDE_SCOPE && proposition.renderAttempted
    );
  };

  const preparePropositions = ({ propositions, metadata }) => {
    return propositions
      .filter(filterPropositionsPredicate)
      .map(proposition => {
        if (isNonEmptyArray(proposition.items)) {
          const { id, scope, scopeDetails } = proposition;
          return {
            id,
            scope,
            scopeDetails,
            items: updatePropositionItems({
              items: proposition.items,
              metadataForScope: metadata[proposition.scope]
            })
          };
        }
        return proposition;
      })
      .filter(proposition => isNonEmptyArray(proposition.items));
  };

  return ({ propositions = [], metadata = {}, viewName }) => {
    // We need to immediately call concat so that subsequent sendEvent
    // calls will wait for applyPropositions to complete before executing.
    const renderedPropositionsDeferred = defer();
    renderedPropositions.concat(renderedPropositionsDeferred.promise);

    const propositionsToExecute = preparePropositions({
      propositions,
      metadata
    }).map(proposition => createProposition(proposition));

    return Promise.resolve()
      .then(() => {
        if (viewName) {
          return viewCache.getView(viewName);
        }
        return [];
      })
      .then(additionalPropositions => {
        const { render, returnedPropositions } = processPropositions([
          ...propositionsToExecute,
          ...additionalPropositions
        ]);

        render().then(renderedPropositionsDeferred.resolve);

        return {
          propositions: returnedPropositions
        };
      });
  };
};
