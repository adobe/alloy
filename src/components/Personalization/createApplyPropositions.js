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

import { defer, isEmptyObject, isNonEmptyArray } from "../../utils";
import {
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  MESSAGE_IN_APP
} from "../../constants/schema";
import PAGE_WIDE_SCOPE from "../../constants/pageWideScope";
import { DOM_ACTION_COLLECT_INTERACTIONS } from "./dom-actions/initDomActionsModules";

const isInteractionTrackingItem = (schema, actionType) =>
  schema === JSON_CONTENT_ITEM &&
  actionType === DOM_ACTION_COLLECT_INTERACTIONS;

const SUPPORTED_SCHEMAS = {
  [DOM_ACTION]: () => true,
  [HTML_CONTENT_ITEM]: () => true,
  [JSON_CONTENT_ITEM]: isInteractionTrackingItem,
  [MESSAGE_IN_APP]: () => true
};

const filterItemsPredicate = (schema, actionType) =>
  typeof SUPPORTED_SCHEMAS[schema] === "function" &&
  SUPPORTED_SCHEMAS[schema](schema, actionType);

export default ({
  processPropositions,
  createProposition,
  renderedPropositions,
  viewCache
}) => {
  const updatePropositionItems = ({ items, metadataForScope = {} }) => {
    const { actionType, selector } = metadataForScope;

    return items
      .filter(item => filterItemsPredicate(item.schema, actionType))
      .map(item => {
        const { schema } = item;

        if (
          schema !== HTML_CONTENT_ITEM &&
          !isInteractionTrackingItem(schema, actionType)
        ) {
          return { ...item };
        }
        if (!isEmptyObject(metadataForScope)) {
          return {
            ...item,
            schema: isInteractionTrackingItem(schema, actionType)
              ? DOM_ACTION
              : schema,
            data: {
              ...item.data,
              selector,
              type: actionType
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
