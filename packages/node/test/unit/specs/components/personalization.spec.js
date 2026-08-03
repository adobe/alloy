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

import { describe, it, expect, vi } from "vitest";
import createPersonalization from "../../../../src/components/personalization.js";

const createFakeEvent = () => ({
  mergeQuery: vi.fn(),
});

describe("Node personalization component", () => {
  it("has the Personalization namespace", () => {
    expect(createPersonalization.namespace).toBe("Personalization");
  });

  it("does nothing when no decisionScopes/surfaces were requested", async () => {
    const event = createFakeEvent();
    const onResponse = vi.fn();
    const { lifecycle } = createPersonalization();

    await lifecycle.onBeforeEvent({ event, onResponse });

    expect(event.mergeQuery).not.toHaveBeenCalled();
    expect(onResponse).not.toHaveBeenCalled();
  });

  it("merges top-level decisionScopes into the request query", async () => {
    const event = createFakeEvent();
    const onResponse = vi.fn();
    const { lifecycle } = createPersonalization();

    await lifecycle.onBeforeEvent({
      event,
      decisionScopes: ["my-scope"],
      onResponse,
    });

    expect(event.mergeQuery).toHaveBeenCalledWith({
      personalization: expect.objectContaining({
        decisionScopes: ["my-scope"],
        surfaces: [],
      }),
    });
  });

  it("merges personalization.surfaces and personalization.decisionScopes, deduping against the top-level list", async () => {
    const event = createFakeEvent();
    const onResponse = vi.fn();
    const { lifecycle } = createPersonalization();

    await lifecycle.onBeforeEvent({
      event,
      decisionScopes: ["scope-a"],
      personalization: {
        decisionScopes: ["scope-a", "scope-b"],
        surfaces: ["web://example.com"],
      },
      onResponse,
    });

    expect(event.mergeQuery).toHaveBeenCalledWith({
      personalization: expect.objectContaining({
        decisionScopes: ["scope-a", "scope-b"],
        surfaces: ["web://example.com"],
      }),
    });
  });

  it("requests every schema applyPropositions can render", async () => {
    const event = createFakeEvent();
    const { lifecycle } = createPersonalization();

    await lifecycle.onBeforeEvent({
      event,
      decisionScopes: ["my-scope"],
      onResponse: vi.fn(),
    });

    const [{ personalization }] = event.mergeQuery.mock.calls[0];
    expect(personalization.schemas).toEqual(
      expect.arrayContaining([
        "https://ns.adobe.com/personalization/default-content-item",
        "https://ns.adobe.com/personalization/html-content-item",
        "https://ns.adobe.com/personalization/json-content-item",
        "https://ns.adobe.com/personalization/redirect-item",
        "https://ns.adobe.com/personalization/ruleset-item",
        "https://ns.adobe.com/personalization/message/in-app",
        "https://ns.adobe.com/personalization/message/content-card",
        "https://ns.adobe.com/personalization/dom-action",
      ]),
    );
  });

  it("returns the personalization:decisions payloads as propositions on response", async () => {
    const event = createFakeEvent();
    let registeredCallback;
    const onResponse = vi.fn((callback) => {
      registeredCallback = callback;
    });
    const { lifecycle } = createPersonalization();

    await lifecycle.onBeforeEvent({
      event,
      decisionScopes: ["my-scope"],
      onResponse,
    });

    const fakeDecisions = [{ id: "1", scope: "my-scope", items: [] }];
    const response = {
      getPayloadsByType: vi.fn((type) => {
        expect(type).toBe("personalization:decisions");
        return fakeDecisions;
      }),
    };

    expect(registeredCallback({ response })).toEqual({
      propositions: fakeDecisions,
    });
  });
});
