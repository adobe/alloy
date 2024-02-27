/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createClickStorage from "../../../../../src/components/Personalization/createClickStorage";

describe("Personalization::createClickStorage", () => {
  let storeClickMeta;
  let getClickMetas;

  let PROPOSITIONS = [];

  let interactIDs = {};

  beforeEach(() => {
    ({ storeClickMeta, getClickMetas } = createClickStorage());

    interactIDs = {
      "div:123:h2": [1],
      "div:123:h1": [2]
    };

    PROPOSITIONS = [
      {
        id: "AT:123",
        scope: "__view__",
        scopeDetails: {
          test: "blah1",
          characteristics: {
            scopeType: "page"
          }
        },
        items: [
          {
            id: "0632668e-53a4-4f31-b092-45696e45829d",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              selector: "div:123:h2"
            },
            characteristics: {
              trackingLabel: "mylabel"
            }
          }
        ]
      },
      {
        id: "AT:123",
        scope: "consent",
        scopeDetails: {
          test: "blah3",
          characteristics: {
            scopeType: "view"
          }
        },
        items: [
          {
            id: "0632668e-53a4-4f31-b092-45696e45829d",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              selector: "div:123:h2"
            }
          }
        ]
      },
      {
        id: "AT:234",
        scope: "consent",
        scopeDetails: {
          test: "blah4",
          characteristics: {
            scopeType: "view"
          }
        },
        items: [
          {
            id: "0632668e-53a4-4f31-b092-45696e45829d",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              selector: "div:123:h2"
            }
          }
        ]
      },
      {
        id: "AT:123",
        scope: "consent",
        scopeDetails: {
          test: "blah5",
          characteristics: {
            scopeType: "view"
          }
        },
        items: [
          {
            id: "0632668e-53a4-4f31-b092-45696e45829d",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              selector: "div:123:h1"
            }
          }
        ]
      }
    ];
  });

  it("returns empty array when no metadata for this selector", () => {
    expect(getClickMetas([1])).toEqual([]);
  });

  it("stores clicks as a map in the click storage and returns the metadata", () => {
    PROPOSITIONS.forEach(proposition => {
      const { id, scope, scopeDetails } = proposition;
      proposition.items.forEach(item =>
        storeClickMeta(
          proposition.id,
          item.id,
          proposition.scopeDetails.characteristics.scopeType,
          { id, scope, scopeDetails },
          interactIDs[item.data.selector]
        )
      );
    });

    expect(getClickMetas(interactIDs["div:123:h2"]).length).toEqual(2);
    expect(getClickMetas(interactIDs["div:123:h1"]).length).toEqual(1);
  });

  it("getClickMetas returns the id, scopeDetails, scope, trackingLabel, and scopeType", () => {
    const proposition = PROPOSITIONS[0];

    proposition.items.forEach(item =>
      storeClickMeta(
        proposition.id,
        item.id,
        proposition.scopeDetails.characteristics.scopeType,
        {
          id: proposition.id,
          scope: proposition.scope,
          scopeDetails: proposition.scopeDetails
        },
        interactIDs[item.data.selector]
      )
    );

    const meta = getClickMetas(interactIDs["div:123:h2"]);

    expect(meta.length).toEqual(1);

    expect(meta[0]).toEqual({
      id: "AT:123",
      scope: "__view__",
      scopeDetails: {
        test: "blah1",
        characteristics: {
          scopeType: "page"
        }
      },
      scopeType: "page",
      items: [
        {
          id: "0632668e-53a4-4f31-b092-45696e45829d"
        }
      ]
    });
  });
});
