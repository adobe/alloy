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

import {
  MIXED_PROPOSITIONS,
  PAGE_WIDE_SCOPE_DECISIONS
} from "./responsesMock/eventResponses";
import createApplyPropositions from "../../../../../src/components/Personalization/createApplyPropositions";
import clone from "../../../../../src/utils/clone";
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition";

const METADATA = {
  home: {
    selector: "#home-item1",
    actionType: "setHtml"
  }
};

describe("Personalization::createApplyPropositions", () => {
  let processPropositions;
  let createProposition;
  let pendingDisplayNotifications;
  let viewCache;
  let applyPropositions;
  let render;

  beforeEach(() => {
    processPropositions = jasmine.createSpy("processPropositions");
    processPropositions.and.callFake(propositions => {
      const returnedPropositions = propositions.map(proposition => ({
        ...proposition.toJSON(),
        renderAttempted: true
      }));
      return { returnedPropositions, render };
    });
    render = jasmine.createSpy("render");
    render.and.callFake(() => Promise.resolve("notifications"));
    createProposition = injectCreateProposition({
      preprocess: data => data,
      isPageWideSurface: () => false
    });

    pendingDisplayNotifications = jasmine.createSpyObj(
      "pendingDisplayNotifications",
      ["concat"]
    );
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
    viewCache.getView.and.returnValue(Promise.resolve([]));
    applyPropositions = createApplyPropositions({
      processPropositions,
      createProposition,
      pendingDisplayNotifications,
      viewCache
    });
  });

  it("it should return an empty propositions promise if propositions is empty array", async () => {
    const result = await applyPropositions({
      propositions: []
    });
    expect(result).toEqual({ propositions: [] });
    expect(processPropositions).toHaveBeenCalledOnceWith([]);
  });

  it("it should apply user-provided dom-action schema propositions", async () => {
    const expectedExecuteDecisionsPropositions = clone(
      PAGE_WIDE_SCOPE_DECISIONS
    ).map(proposition => {
      proposition.items = proposition.items.slice(0, 2);
      return proposition;
    });

    const result = await applyPropositions({
      propositions: PAGE_WIDE_SCOPE_DECISIONS
    });

    expect(processPropositions).toHaveBeenCalledTimes(1);

    const expectedScopes = expectedExecuteDecisionsPropositions.map(
      proposition => proposition.scope
    );
    result.propositions.forEach(proposition => {
      expect(proposition.renderAttempted).toBeTrue();
      expect(expectedScopes).toContain(proposition.scope);
      expect(proposition.items).toBeArrayOfObjects();
      expect(proposition.items.length).toEqual(2);
    });
  });

  it("it should merge metadata with propositions that have html-content-item schema", async () => {
    const { propositions } = await applyPropositions({
      propositions: MIXED_PROPOSITIONS,
      metadata: METADATA
    });

    expect(propositions.length).toEqual(4);
    propositions.forEach(proposition => {
      expect(proposition.items.length).toEqual(1);
      if (proposition.items[0].id === "442358") {
        expect(proposition.items[0].data.selector).toEqual("#root");
        expect(proposition.items[0].data.type).toEqual("click");
      } else if (proposition.items[0].id === "442359") {
        expect(proposition.scope).toEqual("home");
        expect(proposition.items[0].data.selector).toEqual("#home-item1");
        expect(proposition.items[0].data.type).toEqual("setHtml");
      }
    });
    expect(processPropositions).toHaveBeenCalledTimes(1);
  });

  it("it should drop items with html-content-item schema when there is no metadata", async () => {
    const propositions = [
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
        scope: "home",
        items: [
          {
            id: "442359",
            schema: "https://ns.adobe.com/personalization/html-content-item",
            data: {
              content: "<p>Some custom content for the home page</p>",
              format: "text/html",
              id: "1202448"
            }
          },
          {
            id: "442358",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              format: "application/vnd.adobe.target.dom-action",
              selector: "#root"
            }
          }
        ]
      }
    ];

    const result = await applyPropositions({
      propositions
    });

    expect(result.propositions.length).toEqual(1);
    expect(result.propositions[0].items.length).toEqual(1);
    expect(result.propositions[0].items[0].id).toEqual("442358");
    expect(result.propositions[0].renderAttempted).toBeTrue();
  });

  it("it should return renderAttempted = true on resulting propositions", async () => {
    const result = await applyPropositions({
      propositions: MIXED_PROPOSITIONS
    });
    expect(result.propositions.length).toEqual(3);
    result.propositions.forEach(proposition => {
      expect(proposition.renderAttempted).toBeTrue();
    });
  });

  it("it should ignore propositions with __view__ scope that have already been rendered", async () => {
    const propositions = JSON.parse(JSON.stringify(MIXED_PROPOSITIONS));
    propositions[4].renderAttempted = true;

    const result = await applyPropositions({
      propositions
    });
    expect(result.propositions.length).toEqual(2);
    result.propositions.forEach(proposition => {
      expect(proposition.renderAttempted).toBeTrue();
      if (proposition.scope === "__view__") {
        expect(proposition.items[0].id).not.toEqual("442358");
      } else {
        expect(proposition.scope).toEqual("home");
      }
    });
  });

  it("it should ignore items with unsupported schemas", async () => {
    const expectedItemIds = ["442358", "442359"];

    const { propositions } = await applyPropositions({
      propositions: MIXED_PROPOSITIONS
    });
    expect(propositions.length).toEqual(3);
    propositions.forEach(proposition => {
      expect(proposition.items.length).toEqual(1);
      proposition.items.forEach(item => {
        expect(expectedItemIds.indexOf(item.id) > -1);
      });
    });
  });

  it("it should not mutate original propositions", async () => {
    const originalPropositions = clone(MIXED_PROPOSITIONS);
    const result = await applyPropositions({
      propositions: originalPropositions,
      metadata: METADATA
    });

    let numReturnedPropositions = 0;
    expect(originalPropositions).toEqual(MIXED_PROPOSITIONS);
    result.propositions.forEach(proposition => {
      const [original] = originalPropositions.filter(
        originalProposition => originalProposition.id === proposition.id
      );
      if (original) {
        numReturnedPropositions += 1;
        expect(proposition).not.toBe(original);
      }
    });
    expect(numReturnedPropositions).toEqual(4);
  });

  it("concats viewName propositions", async () => {
    viewCache.getView.and.returnValue(
      Promise.resolve([
        createProposition({ id: "myViewNameProp1", items: [{}] })
      ])
    );
    const result = await applyPropositions({
      viewName: "myViewName"
    });
    expect(result).toEqual({
      propositions: [
        {
          id: "myViewNameProp1",
          items: [{}],
          renderAttempted: true
        }
      ]
    });
  });
});
