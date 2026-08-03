/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  DEFAULT_CONTENT_ITEM,
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM,
  RULESET_ITEM,
  MESSAGE_IN_APP,
  MESSAGE_CONTENT_CARD,
} from "@adobe/alloy-core/constants/schema.js";

const DECISIONS_HANDLE = "personalization:decisions";

// Every schema `applyPropositions` (client-side) knows how to process.
// Unlike the browser component, there's no page-wide scope to conditionally
// gate DOM_ACTION on — Node has no page, so it's always requested.
const SCHEMAS = [
  DEFAULT_CONTENT_ITEM,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM,
  RULESET_ITEM,
  MESSAGE_IN_APP,
  MESSAGE_CONTENT_CARD,
  DOM_ACTION,
];

/** @param {Array<string>} array */
const dedupe = (array) =>
  array.filter((item, pos) => array.indexOf(item) === pos);

/**
 * Fetch-only personalization for Node: requests decisions for
 * `decisionScopes`/`personalization.surfaces`/`personalization.decisionScopes`
 * passed to `sendEvent`, and returns the raw `personalization:decisions`
 * payloads as `propositions` — the same shape the browser SDK's
 * `applyPropositions` command expects, so a server can hand them to a
 * client to render.
 *
 * Deliberately does not include any of the browser Personalization
 * component's rendering machinery (DOM actions, view cache, click
 * tracking, display-notification batching, default page-wide scope) —
 * there's no page or DOM in Node to render into or infer a scope from,
 * and rendering-triggered notifications are the client's responsibility
 * once it calls `applyPropositions`.
 */
const createPersonalization = () => ({
  lifecycle: {
    /**
     * @param {Object} params
     * @param {any} params.event
     * @param {string[]} [params.decisionScopes]
     * @param {{ decisionScopes?: string[], surfaces?: string[] }} [params.personalization]
     * @param {(callback: (arg: { response: any }) => Object) => void} params.onResponse
     */
    onBeforeEvent({
      event,
      decisionScopes = [],
      personalization = {},
      onResponse,
    }) {
      const scopes = dedupe([
        ...decisionScopes,
        ...(personalization.decisionScopes || []),
      ]);
      const surfaces = dedupe(personalization.surfaces || []);

      if (scopes.length === 0 && surfaces.length === 0) {
        return Promise.resolve();
      }

      event.mergeQuery({
        personalization: { schemas: SCHEMAS, decisionScopes: scopes, surfaces },
      });

      onResponse(({ response }) => ({
        propositions: response.getPayloadsByType(DECISIONS_HANDLE),
      }));

      return Promise.resolve();
    },
  },
});

createPersonalization.namespace = "Personalization";

export default createPersonalization;
