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

import { defer, isEmptyObject, isNonEmptyArray } from "@adobe/alloy-core/utils";
import {
  DEFAULT_CONTENT_ITEM,
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  MESSAGE_IN_APP,
} from "@adobe/alloy-core/constants/schema.js";
import PAGE_WIDE_SCOPE from "@adobe/alloy-core/constants/pageWideScope.js";
import { DOM_ACTION_COLLECT_INTERACTIONS } from "./dom-actions/initDomActionsModules.js";
import type {
  AsyncArray,
  CreateProposition,
  DecisionMeta,
  ItemPayload,
  ProcessPropositions,
  PropositionPayload,
  ViewCache,
} from "./types.js";

const isInteractionTrackingItem = (
  schema: string,
  actionType: string | undefined,
) =>
  schema === JSON_CONTENT_ITEM &&
  actionType === DOM_ACTION_COLLECT_INTERACTIONS;

const SUPPORTED_SCHEMAS: Record<
  string,
  (schema: string, actionType?: string) => boolean
> = {
  [DOM_ACTION]: () => true,
  [HTML_CONTENT_ITEM]: () => true,
  [JSON_CONTENT_ITEM]: isInteractionTrackingItem,
  [MESSAGE_IN_APP]: () => true,
  [DEFAULT_CONTENT_ITEM]: () => true,
};

const filterItemsPredicate = (schema: string, actionType?: string) =>
  typeof SUPPORTED_SCHEMAS[schema] === "function" &&
  SUPPORTED_SCHEMAS[schema](schema, actionType);

/** Per-scope metadata supplied to applyPropositions. */
interface ScopeMetadata {
  actionType?: string;
  selector?: string;
}

export interface ApplyPropositionsOptions {
  propositions?: PropositionPayload[];
  metadata?: Record<string, ScopeMetadata>;
  viewName?: string;
}

export default ({
  processPropositions,
  createProposition,
  renderedPropositions,
  viewCache,
}: {
  processPropositions: ProcessPropositions;
  createProposition: CreateProposition;
  renderedPropositions: AsyncArray<DecisionMeta>;
  viewCache: ViewCache;
}) => {
  const updatePropositionItems = ({
    items,
    metadataForScope = {},
  }: {
    items: ItemPayload[];
    metadataForScope?: ScopeMetadata;
  }) => {
    const { actionType, selector } = metadataForScope;

    return items
      .filter((item) => filterItemsPredicate(item.schema, actionType))
      .map((item) => {
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
              type: actionType,
            },
          };
        }
        return undefined;
      })
      .filter((item): item is ItemPayload => !!item);
  };

  const filterPropositionsPredicate = (proposition: PropositionPayload) => {
    return !(
      proposition.scope === PAGE_WIDE_SCOPE && proposition.renderAttempted
    );
  };

  const preparePropositions = ({
    propositions,
    metadata,
  }: {
    propositions: PropositionPayload[];
    metadata: Record<string, ScopeMetadata>;
  }): PropositionPayload[] => {
    return propositions
      .filter(filterPropositionsPredicate)
      .map((proposition) => {
        if (isNonEmptyArray(proposition.items)) {
          const { id, scope, scopeDetails } = proposition;
          return {
            id,
            scope,
            scopeDetails,
            items: updatePropositionItems({
              items: proposition.items,
              // A missing scope reads the entry stored under the key "undefined".
              metadataForScope: metadata[proposition.scope as string],
            }),
          };
        }
        return proposition;
      })
      .filter((proposition) => isNonEmptyArray(proposition.items));
  };

  return ({
    propositions = [],
    metadata = {},
    viewName,
  }: ApplyPropositionsOptions) => {
    // We need to immediately call concat so that subsequent sendEvent
    // calls will wait for applyPropositions to complete before executing.
    const renderedPropositionsDeferred = defer<DecisionMeta[]>();
    renderedPropositions.concat(renderedPropositionsDeferred.promise);

    const propositionsToExecute = preparePropositions({
      propositions,
      metadata,
    }).map((proposition) => createProposition(proposition));

    return Promise.resolve()
      .then(() => {
        if (viewName) {
          return viewCache.getView(viewName);
        }
        return [];
      })
      .then((additionalPropositions) => {
        const { render, returnedPropositions } = processPropositions([
          ...propositionsToExecute,
          ...additionalPropositions,
        ]);

        render().then(renderedPropositionsDeferred.resolve);

        return {
          propositions: returnedPropositions,
        };
      });
  };
};
