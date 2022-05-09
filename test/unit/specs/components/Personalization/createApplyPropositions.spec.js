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

import "jasmine-expect";
import { SCOPES_FOO1_FOO2_DECISIONS } from "./responsesMock/eventResponses";
import createApplyPropositions from "../../../../../src/components/Personalization/createApplyPropositions";

const MIXED_PROPOSITIONS = [
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
    scope: "home",
    items: [
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
  },
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
      }
    ]
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
    scope: "home",
    items: [
      {
        id: "442360",
        schema: "https://ns.adobe.com/personalization/json-content-item",
        data: {
          content: "{'field1': 'custom content'}",
          format: "text/javascript",
          id: "1202449"
        }
      }
    ],
    renderAttempted: false
  }
];

const METADATA = {
  home: {
    selector: "#home-item1",
    actionType: "setHtml"
  }
};

describe("Personalization::createApplyPropositions", () => {
  let executeDecisions;
  let showContainers;

  beforeEach(() => {
    showContainers = jasmine.createSpy("showContainers");
    executeDecisions = jasmine.createSpy("executeDecisions");
  });

  it("it should return an empty propositions promise if propositions is empty array", () => {
    const executeDecisionsPromise = {
      then: callback => callback(SCOPES_FOO1_FOO2_DECISIONS)
    };

    executeDecisions.and.returnValue(executeDecisionsPromise);

    const applyPropositions = createApplyPropositions({
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: []
    }).then(result => {
      expect(result).toEqual({ propositions: [] });
      expect(executeDecisions).toHaveBeenCalledTimes(0);
      expect(showContainers).toHaveBeenCalledTimes(0);
    });
  });

  it("it should apply user-provided dom-action schema propositions", () => {
    const executeDecisionsPromise = {
      then: callback => callback(SCOPES_FOO1_FOO2_DECISIONS)
    };

    executeDecisions.and.returnValue(executeDecisionsPromise);

    const applyPropositions = createApplyPropositions({
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: SCOPES_FOO1_FOO2_DECISIONS
    }).then(result => {
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(
        SCOPES_FOO1_FOO2_DECISIONS
      );

      const expectedScopes = SCOPES_FOO1_FOO2_DECISIONS.map(
        proposition => proposition.scope
      );
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
        expect(expectedScopes).toContain(proposition.scope);
        expect(proposition.items).toBeArrayOfObjects();
      });

      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should merge metadata with propositions that have html-content-item schema", () => {
    const applyPropositions = createApplyPropositions({
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS,
      metadata: METADATA
    }).then(() => {
      const executedPropositions = executeDecisions.calls.all()[0].args[0];
      expect(executedPropositions.length).toEqual(3);
      executedPropositions.forEach(proposition => {
        expect(proposition.scope).toEqual("home");
        expect(proposition.items.length).toEqual(1);
        if (proposition.items[0].id === "442358") {
          expect(proposition.items[0].data.selector).toEqual("#root");
          expect(proposition.items[0].data.type).toEqual("click");
        } else if (proposition.items[0].id === "442359") {
          expect(proposition.items[0].data.selector).toEqual("#home-item1");
          expect(proposition.items[0].data.type).toEqual("setHtml");
        } else if (proposition.items[0].id === "442360") {
          expect(proposition.items[0].data.selector).toBeUndefined();
          expect(proposition.items[0].data.type).toBeUndefined();
        }
      });
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should use default metadata with propositions that have html-content-item schema when user has not provided metadata", () => {
    const applyPropositions = createApplyPropositions({
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS
    }).then(() => {
      const executedPropositions = executeDecisions.calls.all()[0].args[0];
      expect(executedPropositions.length).toEqual(3);
      executedPropositions.forEach(proposition => {
        expect(proposition.scope).toEqual("home");
        expect(proposition.items.length).toEqual(1);
        if (proposition.items[0].id === "442358") {
          expect(proposition.items[0].data.selector).toEqual("#root");
          expect(proposition.items[0].data.type).toEqual("click");
        } else if (proposition.items[0].id === "442359") {
          expect(proposition.items[0].data.selector).toEqual("head");
          expect(proposition.items[0].data.type).toEqual("appendHtml");
        } else if (proposition.items[0].id === "442360") {
          expect(proposition.items[0].data.selector).toBeUndefined();
          expect(proposition.items[0].data.type).toBeUndefined();
        }
      });
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should use default metadata with propositions that have html-content-item schema when user-provided metadata is missing the matching scope", () => {
    const applyPropositions = createApplyPropositions({
      executeDecisions,
      showContainers
    });

    const metadata = {
      randomScope: {
        selector: "#home-item1",
        actionType: "setHtml"
      }
    };

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS,
      metadata
    }).then(() => {
      const executedPropositions = executeDecisions.calls.all()[0].args[0];
      expect(executedPropositions.length).toEqual(3);
      executedPropositions.forEach(proposition => {
        expect(proposition.scope).toEqual("home");
        expect(proposition.items.length).toEqual(1);
        if (proposition.items[0].id === "442358") {
          expect(proposition.items[0].data.selector).toEqual("#root");
          expect(proposition.items[0].data.type).toEqual("click");
        } else if (proposition.items[0].id === "442359") {
          expect(proposition.items[0].data.selector).toEqual("head");
          expect(proposition.items[0].data.type).toEqual("appendHtml");
        } else if (proposition.items[0].id === "442360") {
          expect(proposition.items[0].data.selector).toBeUndefined();
          expect(proposition.items[0].data.type).toBeUndefined();
        }
      });
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should set renderAttempted = true for all user-provided propositions", () => {
    const applyPropositions = createApplyPropositions({
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS
    }).then(result => {
      expect(result.propositions.length).toEqual(3);
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
      });
    });
  });
});
