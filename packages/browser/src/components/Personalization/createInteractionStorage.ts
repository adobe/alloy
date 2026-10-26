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

import type {
  ClickMeta,
  GetInteractionMetas,
  StoreInteractionMeta,
} from "./types.js";

interface MetaEntry {
  proposition: ClickMeta;
  items: Set<string | undefined>;
}

export default () => {
  const clickMetaStorage: Record<number, Record<string, ClickMeta>> = {};
  /*
        clickMetaStorage example.
        `abc' and 'def' are proposition IDs.  1 is an interact id.  The object with an id, scope and scopeDetails
        is the notification.

          {
            1: {
              "abc": { "id": "abc", "scope": "proposition", "scopeDetails": {} },
              "def": { "id": "def", "scope": "proposition", "scopeDetails": {} }
            }
          }
  */

  const clickItemStorage: Record<
    number,
    Record<string, Set<string | undefined>>
  > = {};
  /*
        clickItemStorage example.
        `abc' and 'def' are proposition IDs.  1 is an interact id.  The sets contain proposition-item IDs which
        are used in notifications that are sent.

          {
            1: {
              abc: new Set(["itemAAA", "itemCCC"]),
              def: new Set(["itemEEE", "itemFFF"]),
            },
          }
  */

  const storeInteractionMeta: StoreInteractionMeta = (
    propositionId,
    itemId,
    scopeType,
    notification,
    interactIdInput,
  ) => {
    const interactId = parseInt(String(interactIdInput), 10);
    // A missing proposition id is stored under the key "undefined".
    const propositionKey = String(propositionId);

    if (!clickMetaStorage[interactId]) {
      clickMetaStorage[interactId] = {};
      clickItemStorage[interactId] = {};
    }

    if (!clickItemStorage[interactId][propositionKey]) {
      clickItemStorage[interactId][propositionKey] = new Set();
    }

    clickItemStorage[interactId][propositionKey].add(itemId);

    clickMetaStorage[interactId][propositionKey] = {
      ...notification,
      scopeType,
    };
  };

  const getInteractionMetas: GetInteractionMetas = (interactIds) => {
    if (!Array.isArray(interactIds) || interactIds.length === 0) {
      return [];
    }

    return Object.values(
      interactIds
        .map((value) => parseInt(value, 10))
        .reduce(
          (metaMap, interactId) => {
            Object.keys(clickMetaStorage[interactId] || {}).forEach(
              (propositionId) => {
                if (!metaMap[propositionId]) {
                  metaMap[propositionId] = {
                    proposition: clickMetaStorage[interactId][propositionId],
                    items: new Set(),
                  };
                }

                metaMap[propositionId].items = new Set([
                  ...metaMap[propositionId].items,
                  ...clickItemStorage[interactId][propositionId],
                ]);
              },
            );
            return metaMap;
          },
          {} as Record<string, MetaEntry>,
        ),
    ).map(({ proposition, items }) => ({
      ...proposition,
      items: Array.from(items).map((id) => ({ id })),
    }));
  };

  return {
    storeInteractionMeta,
    getInteractionMetas,
  };
};
