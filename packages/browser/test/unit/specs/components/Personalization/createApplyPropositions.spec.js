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

import { vi, beforeEach, describe, it, expect } from "vitest";
import {
  MIXED_PROPOSITIONS,
  PAGE_WIDE_SCOPE_DECISIONS,
} from "./responsesMock/eventResponses.js";
import createApplyPropositions from "../../../../../src/components/Personalization/createApplyPropositions.js";
import clone from "@adobe/alloy-core/utils/clone.js";
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition.js";
import createMockProposition from "../../../helpers/createMockProposition.js";
import { DOM_ACTION_COLLECT_INTERACTIONS } from "../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";
import {
  JSON_CONTENT_ITEM,
  DOM_ACTION,
} from "@adobe/alloy-core/constants/schema.js";

const METADATA = {
  home: {
    selector: "#home-item1",
    actionType: "setHtml",
  },
};

const CLICK_DOM_ACTION_ITEM_ID = "442358";
const HTML_CONTENT_ITEM_ID = "442359";
const REMAINING_VIEW_DOM_ACTION_ITEM_ID = "442379";

describe("Personalization::createApplyPropositions", () => {
  let processPropositions;
  let createProposition;
  let renderedPropositions;
  let viewCache;
  let applyPropositions;
  let render;

  beforeEach(() => {
    processPropositions = vi.fn();
    processPropositions.mockImplementation((propositions) => {
      const returnedPropositions = propositions.map((proposition) => ({
        ...proposition.toJSON(),
        renderAttempted: true,
      }));
      return {
        returnedPropositions,
        render,
      };
    });

    render = vi.fn();
    render.mockImplementation(() => Promise.resolve("notifications"));

    createProposition = injectCreateProposition({
      preprocess: (data) => data,
      isPageWideSurface: () => false,
    });

    renderedPropositions = {
      concat: vi.fn(),
    };

    viewCache = {
      getView: vi.fn(),
    };

    viewCache.getView.mockReturnValue(Promise.resolve([]));

    applyPropositions = createApplyPropositions({
      processPropositions,
      createProposition,
      renderedPropositions,
      viewCache,
    });
  });

  it("should return an empty propositions promise if propositions is empty array", async () => {
    const result = await applyPropositions({
      propositions: [],
    });

    expect(result).toEqual({
      propositions: [],
    });
    expect(processPropositions).toHaveBeenNthCalledWith(1, []);
  });

  it("should apply user-provided dom-action/default-content schema propositions", async () => {
    const expectedExecuteDecisionsPropositions = clone(
      PAGE_WIDE_SCOPE_DECISIONS,
    ).map((proposition) => {
      proposition.items = proposition.items.slice(0, 2);
      return proposition;
    });
    const result = await applyPropositions({
      propositions: PAGE_WIDE_SCOPE_DECISIONS,
    });
    expect(processPropositions).toHaveBeenCalledTimes(1);

    const expectedScopes = expectedExecuteDecisionsPropositions.map(
      (proposition) => proposition.scope,
    );
    result.propositions.forEach((proposition) => {
      expect(proposition.renderAttempted).toBe(true);
      expect(expectedScopes).toContain(proposition.scope);
      expect(proposition.items).toEqual(
        expect.arrayContaining([expect.any(Object)]),
      );
      expect(proposition.items.length).toEqual(3);
    });
  });

  it("should merge metadata with propositions that have html-content-item schema", async () => {
    const { propositions } = await applyPropositions({
      propositions: MIXED_PROPOSITIONS,
      metadata: METADATA,
    });
    const clickActionPropositions = propositions.filter(
      (proposition) => proposition.items[0].id === CLICK_DOM_ACTION_ITEM_ID,
    );
    const htmlContentPropositions = propositions.filter(
      (proposition) => proposition.items[0].id === HTML_CONTENT_ITEM_ID,
    );

    expect(propositions.length).toEqual(4);
    propositions.forEach((proposition) => {
      expect(proposition.items.length).toEqual(1);
    });
    clickActionPropositions.forEach((proposition) => {
      expect(proposition.items[0].data.selector).toEqual("#root");
      expect(proposition.items[0].data.type).toEqual("click");
    });
    htmlContentPropositions.forEach((proposition) => {
      expect(proposition.scope).toEqual("home");
      expect(proposition.items[0].data.selector).toEqual("#home-item1");
      expect(proposition.items[0].data.type).toEqual("setHtml");
    });
    expect(processPropositions).toHaveBeenCalledTimes(1);
  });

  it("should drop items with html-content-item schema when there is no metadata", async () => {
    const propositions = [
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
        scope: "home",
        items: [
          {
            id: HTML_CONTENT_ITEM_ID,
            schema: "https://ns.adobe.com/personalization/html-content-item",
            data: {
              content: "<p>Some custom content for the home page</p>",
              format: "text/html",
              id: "1202448",
            },
          },
          {
            id: CLICK_DOM_ACTION_ITEM_ID,
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              format: "application/vnd.adobe.target.dom-action",
              selector: "#root",
            },
          },
        ],
      },
    ];
    const result = await applyPropositions({
      propositions,
    });
    expect(result.propositions.length).toEqual(1);
    expect(result.propositions[0].items.length).toEqual(1);
    expect(result.propositions[0].items[0].id).toEqual(
      CLICK_DOM_ACTION_ITEM_ID,
    );
    expect(result.propositions[0].renderAttempted).toBe(true);
  });

  it("should return renderAttempted = true on resulting propositions", async () => {
    const result = await applyPropositions({
      propositions: MIXED_PROPOSITIONS,
    });
    expect(result.propositions.length).toEqual(3);
    result.propositions.forEach((proposition) => {
      expect(proposition.renderAttempted).toBe(true);
    });
  });

  it("should ignore propositions with __view__ scope that have already been rendered", async () => {
    const propositions = JSON.parse(JSON.stringify(MIXED_PROPOSITIONS));
    propositions[4].renderAttempted = true;
    const result = await applyPropositions({
      propositions,
    });
    const remainingViewPropositions = result.propositions.filter(
      (proposition) => proposition.scope === "__view__",
    );
    const nonViewPropositions = result.propositions.filter(
      (proposition) => proposition.scope !== "__view__",
    );

    expect(result.propositions.length).toEqual(2);
    result.propositions.forEach((proposition) => {
      expect(proposition.renderAttempted).toBe(true);
    });
    remainingViewPropositions.forEach((proposition) => {
      expect(proposition.items[0].id).not.toEqual(CLICK_DOM_ACTION_ITEM_ID);
    });
    nonViewPropositions.forEach((proposition) => {
      expect(proposition.scope).toEqual("home");
    });
  });

  it("should ignore items with unsupported schemas", async () => {
    const expectedItemIds = [
      CLICK_DOM_ACTION_ITEM_ID,
      REMAINING_VIEW_DOM_ACTION_ITEM_ID,
    ];

    const { propositions } = await applyPropositions({
      propositions: MIXED_PROPOSITIONS,
    });

    expect(propositions.length).toEqual(3);

    propositions.forEach((proposition) => {
      expect(proposition.items.length).toEqual(1);

      proposition.items.forEach((item) => {
        expect(expectedItemIds.indexOf(item.id) > -1).toBe(true);
      });
    });
  });

  it("should not mutate original propositions", async () => {
    const originalPropositions = clone(MIXED_PROPOSITIONS);
    const result = await applyPropositions({
      propositions: originalPropositions,
      metadata: METADATA,
    });
    const originalPropositionsById = new Map(
      originalPropositions.map((originalProposition) => [
        originalProposition.id,
        originalProposition,
      ]),
    );
    const returnedPropositionPairs = result.propositions.map((proposition) => ({
      proposition,
      originalProposition: originalPropositionsById.get(proposition.id),
    }));
    const returnedPropositionPairsWithOriginals =
      returnedPropositionPairs.filter(({ originalProposition }) =>
        Boolean(originalProposition),
      );

    expect(originalPropositions).toEqual(MIXED_PROPOSITIONS);
    expect(returnedPropositionPairsWithOriginals).toHaveLength(4);
    returnedPropositionPairsWithOriginals.forEach(
      ({ proposition, originalProposition }) => {
        expect(proposition).not.toBe(originalProposition);
      },
    );
  });
  it("concats viewName propositions", async () => {
    viewCache.getView.mockReturnValue(
      Promise.resolve([
        createProposition({
          id: "myViewNameProp1",
          items: [{}],
        }),
      ]),
    );
    const result = await applyPropositions({
      viewName: "myViewName",
    });
    expect(result).toEqual({
      propositions: [
        {
          id: "myViewNameProp1",
          items: [{}],
          renderAttempted: true,
        },
      ],
    });
  });
  it("handles track actions for json-content-item", async () => {
    const testElementId = "superfluous123";
    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: {
        isGood: true,
      },
    });

    const expectedProposition = {
      id: "id",
      scope: "scope",
      scopeDetails: {
        decisionProvider: "AJO",
      },
      items: [
        {
          id: "abc",
          schema: DOM_ACTION,
          data: {
            isGood: true,
            selector: "#superfluous123",
            type: DOM_ACTION_COLLECT_INTERACTIONS,
          },
        },
      ],
    };

    const result = await applyPropositions({
      propositions: [proposition.toJSON()],
      metadata: {
        scope: {
          selector: `#${testElementId}`,
          actionType: DOM_ACTION_COLLECT_INTERACTIONS,
        },
      },
    });

    expect(result).toEqual({
      propositions: [
        {
          ...expectedProposition,
          renderAttempted: true,
        },
      ],
    });
    expect(processPropositions).toHaveBeenCalledTimes(1);
    expect(processPropositions.mock.calls[0][0][0].toJSON()).toEqual(
      expectedProposition,
    );
  });
});
