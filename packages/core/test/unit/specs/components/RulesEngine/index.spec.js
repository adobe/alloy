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
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import createRulesEngine from "../../../../../src/components/RulesEngine/index.js";
import { defer } from "../../../../../src/utils/index.js";
import {
  mockRulesetResponseWithCondition,
  proposition,
} from "./contextTestUtils.js";

describe("createRulesEngine:commands:evaluateRulesets", () => {
  let mergeData;
  let mockEvent;
  let onResponseHandler;
  let awaitConsentDeferred;
  let consent;
  let getBrowser;
  let persistentStorage;
  let originalReferrer;

  beforeEach(() => {
    mergeData = vi.fn();
    awaitConsentDeferred = defer();
    consent = {
      awaitConsent: vi.fn().mockReturnValue(awaitConsentDeferred.promise),
    };
    getBrowser = vi.fn().mockReturnValue("foo");
    originalReferrer = window.referrer;
    window.referrer =
      "https://www.google.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer";

    persistentStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };

    persistentStorage.getItem = vi.fn().mockResolvedValue(null);
    persistentStorage.setItem = vi.fn().mockResolvedValue(true);

    mockEvent = {
      getContent: () => ({}),
      hasQuery: () => true,
      getViewName: () => undefined,
      mergeData,
    };
  });

  afterEach(() => {
    window.referrer = originalReferrer;
  });

  const setUpDecisionEngine = ({ personalizationStorageEnabled }) => {
    const config = {
      orgId: "exampleOrgId",
      personalizationStorageEnabled,
    };

    const rulesEngine = createRulesEngine({
      config,
      consent,
      getBrowser,
      logger: { info: vi.fn() },
      platformServices: {
        storage: {
          createNamespacedStorage: vi.fn().mockReturnValue({
            persistent: persistentStorage,
          }),
        },
        globals: {
          getWindowContext: () => ({
            title: document.title,
            url: window.location.href,
            referrer: window.referrer,
            height: window.innerHeight,
            width: window.innerWidth,
            scrollY: window.scrollY,
            scrollX: window.scrollX,
          }),
        },
      },
    });

    rulesEngine.lifecycle.onComponentsRegistered(() => {});
    return rulesEngine;
  };

  it("should run the evaluateRulesets command and satisfy the rule based on global context", async () => {
    const rulesEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true,
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = (onResponse) => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/search"],
          },
          type: "matcher",
        }),
      });
    };

    rulesEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      personalization: {
        decisionContext: {},
      },
      onResponse: onResponseHandler,
    });

    const result = rulesEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition],
    });
  });

  it("should run the evaluateRulesets command and does not satisfy rule due to unmatched global context", async () => {
    const rulesEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true,
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = (onResponse) => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/about"],
          },
          type: "matcher",
        }),
      });
    };
    rulesEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      personalization: {
        decisionContext: {},
      },
      onResponse: onResponseHandler,
    });
    const result = rulesEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [],
    });
  });
  it("should run the evaluateRulesets command and return propositions with renderDecisions true", async () => {
    const rulesEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true,
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = (onResponse) => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/search"],
          },
          type: "matcher",
        }),
      });
    };
    rulesEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      personalization: {
        decisionContext: {},
      },
      onResponse: onResponseHandler,
    });
    const result = rulesEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition],
    });
  });
  it("should run the evaluateRulesets command returns propositions with renderDecisions false", async () => {
    const rulesEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true,
    });

    await awaitConsentDeferred.resolve();

    onResponseHandler = (onResponse) => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/search"],
          },
          type: "matcher",
        }),
      });
    };

    rulesEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: false,
      personalization: {
        decisionContext: {},
      },
      onResponse: onResponseHandler,
    });

    const result = rulesEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition],
    });
  });
  it("should clear the local storage when personalizationStorageEnabled is false", async () => {
    setUpDecisionEngine({
      personalizationStorageEnabled: false,
    });
    await awaitConsentDeferred.resolve();
    expect(persistentStorage.clear).toHaveBeenCalled();
  });
  it("should set eventRegistry storage when consent is obtained", async () => {
    setUpDecisionEngine({
      personalizationStorageEnabled: true,
    });
    await awaitConsentDeferred.resolve();
    await expect(awaitConsentDeferred.promise).resolves.toBe(undefined);
    expect(persistentStorage.getItem).toHaveBeenCalled();
  });
  it("should clear the local storage when consent is not obtained", async () => {
    setUpDecisionEngine({
      personalizationStorageEnabled: true,
    });
    await awaitConsentDeferred.reject();
    await expect(awaitConsentDeferred.promise).rejects.toBe(undefined);
    expect(persistentStorage.clear).toHaveBeenCalled();
  });
});

describe("createRulesEngine:lifecycle:onBeforeRequest", () => {
  const ACTIVITY_ID = "campaign#treatment";
  const CONTENT_CARD_SCHEMA =
    "https://ns.adobe.com/personalization/message/content-card";

  const matcher = (key, value) => ({
    type: "matcher",
    definition: { key, matcher: "eq", values: [value] },
  });

  const historical = (eventType, matcherName, value) => ({
    type: "historical",
    definition: {
      events: [{ "iam.eventType": eventType, "iam.id": ACTIVITY_ID }],
      matcher: matcherName,
      value,
    },
  });

  const isDismissOfActivity = [
    matcher("xdm.eventType", "decisioning.propositionDismiss"),
    matcher(
      "xdm._experience.decisioning.propositions.0.scopeDetails.activity.id",
      ACTIVITY_ID,
    ),
  ];

  const rule = (conditions, detail) => ({
    condition: {
      type: "group",
      definition: { logic: "and", conditions },
    },
    consequences: [{ id: `${detail.id}-consequence`, type: "schema", detail }],
  });

  const eventHistoryRule = (conditions, operation, eventType) =>
    rule(conditions, {
      id: `${eventType}-detail`,
      schema: "https://ns.adobe.com/personalization/eventHistoryOperation",
      data: {
        operation,
        content: { "iam.id": ACTIVITY_ID, "iam.eventType": eventType },
      },
    });

  const cardRule = (conditions) =>
    rule(conditions, {
      id: "card-detail",
      schema: CONTENT_CARD_SCHEMA,
      data: { content: { title: { content: "Hello" } } },
    });

  const disqualifyOnDismissRules = [
    eventHistoryRule(isDismissOfActivity, "insertIfNotExists", "disqualify"),
    cardRule([historical("disqualify", "eq", 0)]),
  ];

  const createPayload = (rules) => ({
    id: "proposition-id",
    scope: "web://mywebsite.com/#cards",
    scopeDetails: {
      decisionProvider: "AJO",
      activity: { id: ACTIVITY_ID },
    },
    items: [
      {
        id: "ruleset-item-id",
        schema: "https://ns.adobe.com/personalization/ruleset-item",
        data: { version: 1, rules },
      },
    ],
  });

  const createOutgoingEvent = (eventType, propositionEventType) => ({
    hasQuery: () => false,
    getContent: () => ({
      xdm: {
        eventType,
        _experience: {
          decisioning: {
            propositionEventType: { [propositionEventType]: 1 },
            propositions: [
              {
                id: "proposition-id",
                scope: "web://mywebsite.com/#cards",
                scopeDetails: {
                  decisionProvider: "AJO",
                  activity: { id: ACTIVITY_ID },
                },
              },
            ],
          },
        },
      },
    }),
  });

  const createRequest = (events) => ({
    getPayload: () => ({ toJSON: () => ({ events }) }),
  });

  let rulesEngine;

  const getCardItems = () =>
    rulesEngine.commands.evaluateRulesets
      .run({})
      .propositions.flatMap(({ items }) => items)
      .filter(({ schema }) => schema === CONTENT_CARD_SCHEMA);

  const setUp = (rules) => {
    rulesEngine = createRulesEngine({
      config: { orgId: "exampleOrgId", personalizationStorageEnabled: false },
      consent: { awaitConsent: vi.fn().mockResolvedValue(undefined) },
      getBrowser: vi.fn().mockReturnValue("foo"),
      logger: { info: vi.fn() },
      platformServices: {
        storage: {
          createNamespacedStorage: vi.fn().mockReturnValue({
            persistent: {
              getItem: vi.fn(),
              setItem: vi.fn(),
              clear: vi.fn(),
            },
          }),
        },
        globals: {
          getWindowContext: () => ({
            title: "title",
            url: "https://mywebsite.com/",
            referrer: "",
            height: 100,
            width: 100,
            scrollY: 0,
            scrollX: 0,
          }),
        },
      },
    });
    rulesEngine.lifecycle.onComponentsRegistered({
      lifecycle: { onDecision: vi.fn() },
    });

    rulesEngine.lifecycle.onBeforeEvent({
      event: {
        getContent: () => ({ query: {} }),
        hasQuery: () => true,
        getUserIdentityMap: () => undefined,
      },
      renderDecisions: false,
      onResponse: (handler) =>
        handler({
          response: { getPayloadsByType: () => [createPayload(rules)] },
        }),
    });
  };

  const sendDismiss = () =>
    rulesEngine.lifecycle.onBeforeRequest({
      request: createRequest([
        createOutgoingEvent("decisioning.propositionDismiss", "dismiss"),
      ]),
    });

  beforeEach(() => setUp(disqualifyOnDismissRules));

  it("applies event history operations from rules matching an outgoing dismiss event", () => {
    expect(getCardItems().length).toBe(1);

    sendDismiss();

    expect(getCardItems()).toEqual([]);
  });

  it("does not write event history for outgoing events no rule reacts to", () => {
    rulesEngine.lifecycle.onBeforeRequest({
      request: createRequest([
        createOutgoingEvent("decisioning.propositionDisplay", "display"),
      ]),
    });

    expect(getCardItems().length).toBe(1);
  });

  it("does not evaluate rules for outgoing events that carry a personalization query", () => {
    const event = createOutgoingEvent(
      "decisioning.propositionDismiss",
      "dismiss",
    );
    event.hasQuery = () => true;

    rulesEngine.lifecycle.onBeforeRequest({ request: createRequest([event]) });

    expect(getCardItems().length).toBe(1);
  });

  it("does not record trigger events while evaluating outgoing events", () => {
    setUp([
      eventHistoryRule(isDismissOfActivity, "insert", "seen"),
      cardRule([historical("trigger", "le", 1)]),
    ]);

    sendDismiss();

    expect(getCardItems().length).toBe(1);
  });
});
