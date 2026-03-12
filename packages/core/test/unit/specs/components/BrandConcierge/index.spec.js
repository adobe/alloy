/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import createConciergeComponent from "../../../../../src/components/BrandConcierge/index.js";
import testConfigValidators from "../../../helpers/testConfigValidators.js";

describe("BrandConcierge", () => {
  let mockDependencies;
  let originalFetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = vi.fn();

    mockDependencies = {
      loggingCookieJar: {
        remove: vi.fn(),
        get: vi.fn(),
        set: vi.fn(),
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        logOnBeforeNetworkRequest: vi.fn(),
        logOnNetworkError: vi.fn(),
      },
      eventManager: {
        createEvent: vi.fn(),
      },
      consent: {
        suspend: vi.fn(),
        resume: vi.fn(),
      },
      instanceName: "test-instance",
      sendEdgeNetworkRequest: vi.fn(),
      config: {
        orgId: "testorgid@AdobeOrg",
        edgeConfigId: "test-edge-config-id",
        conversation: {
          stickyConversationSession: false,
        },
      },
      lifecycle: {
        onBeforeEvent: vi.fn(),
        onBeforeRequest: vi.fn(),
        onRequestFailure: vi.fn(),
      },
      cookieTransfer: {
        cookiesToPayload: vi.fn(),
      },
      createResponse: vi.fn(),
      apexDomain: "adobe.com",
    };
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it("creates a brand concierge component", () => {
    const component = createConciergeComponent(mockDependencies);

    expect(component).toBeDefined();
    expect(component.commands).toBeDefined();
    expect(component.commands.sendConversationEvent).toBeDefined();
  });

  it("has correct namespace", () => {
    expect(createConciergeComponent.namespace).toBe("BrandConcierge");
  });

  it("generates a new session id when stickyConversationSession is false", () => {
    const configWithSticky = {
      ...mockDependencies.config,
      conversation: {
        stickyConversationSession: false,
      },
    };

    createConciergeComponent({
      ...mockDependencies,
      config: configWithSticky,
    });

    // When sticky is false, a new UUID is generated without reading the cookie
    expect(mockDependencies.loggingCookieJar.get).not.toHaveBeenCalled();
  });

  it("reads session cookie when stickyConversationSession is true", () => {
    const configWithSticky = {
      ...mockDependencies.config,
      conversation: {
        stickyConversationSession: true,
      },
    };

    createConciergeComponent({
      ...mockDependencies,
      config: configWithSticky,
    });

    expect(mockDependencies.loggingCookieJar.get).toHaveBeenCalledWith(
      "kndctr_testorgid_AdobeOrg_bc_session_id",
    );
  });

  it("sendConversationEvent command has options validator", () => {
    const component = createConciergeComponent(mockDependencies);

    expect(
      component.commands.sendConversationEvent.optionsValidator,
    ).toBeDefined();
    expect(
      typeof component.commands.sendConversationEvent.optionsValidator,
    ).toBe("function");
  });

  it("sendConversationEvent command has run function", () => {
    const component = createConciergeComponent(mockDependencies);

    expect(component.commands.sendConversationEvent.run).toBeDefined();
    expect(typeof component.commands.sendConversationEvent.run).toBe(
      "function",
    );
  });

  describe("onBeforeEvent lifecycle", () => {
    let originalLocation;

    beforeEach(() => {
      originalLocation = window.location;
      delete window.location;
      window.location = { search: "" };
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it("merges referringSource into XDM when sourcesParam is configured and query param exists", () => {
      window.location.search = "?src=email_campaign";

      const component = createConciergeComponent({
        ...mockDependencies,
        config: {
          ...mockDependencies.config,
          conversation: {
            ...mockDependencies.config.conversation,
            sourcesParam: "src",
          },
        },
      });

      const event = { mergeXdm: vi.fn() };
      component.lifecycle.onBeforeEvent({ event });

      expect(event.mergeXdm).toHaveBeenCalledWith({
        channel: { referringSource: "email_campaign" },
      });
    });

    it("does not merge referringSource when sourcesParam is empty string", () => {
      window.location.search = "?source=email_campaign";

      const component = createConciergeComponent({
        ...mockDependencies,
        config: {
          ...mockDependencies.config,
          conversation: {
            ...mockDependencies.config.conversation,
            sourcesParam: "",
          },
        },
      });

      const event = { mergeXdm: vi.fn() };
      component.lifecycle.onBeforeEvent({ event });

      expect(event.mergeXdm).not.toHaveBeenCalled();
    });

    it("does not merge referringSource when sourcesParam is not configured", () => {
      window.location.search = "?source=email_campaign";

      const component = createConciergeComponent(mockDependencies);

      const event = { mergeXdm: vi.fn() };
      component.lifecycle.onBeforeEvent({ event });

      expect(event.mergeXdm).not.toHaveBeenCalled();
    });

    it("merges undefined referringSource when query param is not present", () => {
      window.location.search = "?other=value";

      const component = createConciergeComponent({
        ...mockDependencies,
        config: {
          ...mockDependencies.config,
          conversation: {
            ...mockDependencies.config.conversation,
            sourcesParam: "src",
          },
        },
      });

      const event = { mergeXdm: vi.fn() };
      component.lifecycle.onBeforeEvent({ event });

      expect(event.mergeXdm).toHaveBeenCalledWith({
        channel: { referringSource: undefined },
      });
    });

    it("uses the configured sourcesParam as the query parameter name", () => {
      window.location.search = "?custom_source=social_media";

      const component = createConciergeComponent({
        ...mockDependencies,
        config: {
          ...mockDependencies.config,
          conversation: {
            ...mockDependencies.config.conversation,
            sourcesParam: "custom_source",
          },
        },
      });

      const event = { mergeXdm: vi.fn() };
      component.lifecycle.onBeforeEvent({ event });

      expect(event.mergeXdm).toHaveBeenCalledWith({
        channel: { referringSource: "social_media" },
      });
    });
  });
});

describe("BrandConcierge config validators", () => {
  testConfigValidators({
    configValidators: createConciergeComponent.configValidators,
    validConfigurations: [
      { conversation: { stickyConversationSession: true } },
      { conversation: { stickyConversationSession: false } },
      { conversation: { streamTimeout: 10000 } },
      { conversation: { streamTimeout: 20000 } },
      {
        conversation: { stickyConversationSession: true, streamTimeout: 10000 },
      },
      {},
      { conversation: { sourcesParam: "src" } },
      { conversation: { sourcesParam: "" } },
      { conversation: { sourcesParam: "custom_source" } },
    ],
    invalidConfigurations: [
      { conversation: { stickyConversationSession: "invalid" } },
      { conversation: { stickyConversationSession: 123 } },
      { conversation: { streamTimeout: "invalid" } },
      { conversation: { streamTimeout: -1 } },
      { conversation: { streamTimeout: 1.5 } },
      { conversation: { sourcesParam: 123 } },
      { conversation: { sourcesParam: true } },
    ],
    defaultValues: {},
  });
  it("provides default values for concierge configuration", () => {
    const config = createConciergeComponent.configValidators({});
    expect(config.conversation.stickyConversationSession).toBe(false);
    expect(config.conversation.streamTimeout).toBe(10000);
    expect(config.conversation.sourcesParam).toBe("");
  });
});
