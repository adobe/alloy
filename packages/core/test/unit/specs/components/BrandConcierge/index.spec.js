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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createConciergeComponent from "../../../../../src/components/BrandConcierge/index.js";
import testConfigValidators from "../../../helpers/testConfigValidators.js";

describe("BrandConcierge", () => {
  let mockDependencies;

  beforeEach(() => {
    // Mock window.fetch
    window.fetch = vi.fn();

    mockDependencies = {
      loggingCookieJar: {
        remove: vi.fn(),
        get: vi.fn(),
        set: vi.fn()
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        logOnBeforeNetworkRequest: vi.fn(),
        logOnNetworkError: vi.fn()
      },
      eventManager: {
        createEvent: vi.fn()
      },
      consent: {
        suspend: vi.fn(),
        resume: vi.fn()
      },
      instanceName: "test-instance",
      sendEdgeNetworkRequest: vi.fn(),
      config: {
        orgId: "testorgid@AdobeOrg",
        edgeConfigId: "test-edge-config-id",
        stickyConversationSession: false
      },
      lifecycle: {
        onBeforeEvent: vi.fn(),
        onBeforeRequest: vi.fn(),
        onRequestFailure: vi.fn()
      },
      cookieTransfer: {
        cookiesToPayload: vi.fn()
      },
      createResponse: vi.fn(),
      apexDomain: "adobe.com"
    };
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

  it("removes session cookie when stickyConversationSession is false", () => {
    const configWithSticky = {
      ...mockDependencies.config,
      stickyConversationSession: false
    };

    createConciergeComponent({
      ...mockDependencies,
      config: configWithSticky
    });

    expect(mockDependencies.loggingCookieJar.remove).toHaveBeenCalledWith(
      "kndctr_testorgid_AdobeOrg_bc_session_id",
      { domain: "adobe.com" }
    );
  });

  it("does not remove session cookie when stickyConversationSession is true", () => {
    const configWithSticky = {
      ...mockDependencies.config,
      stickyConversationSession: true
    };

    createConciergeComponent({
      ...mockDependencies,
      config: configWithSticky
    });

    expect(mockDependencies.loggingCookieJar.remove).not.toHaveBeenCalled();
  });

  it("sendConversationEvent command has options validator", () => {
    const component = createConciergeComponent(mockDependencies);

    expect(component.commands.sendConversationEvent.optionsValidator).toBeDefined();
    expect(typeof component.commands.sendConversationEvent.optionsValidator).toBe("function");
  });

  it("sendConversationEvent command has run function", () => {
    const component = createConciergeComponent(mockDependencies);

    expect(component.commands.sendConversationEvent.run).toBeDefined();
    expect(typeof component.commands.sendConversationEvent.run).toBe("function");
  });
});

describe("BrandConcierge config validators", () => {
  testConfigValidators({
    configValidators: createConciergeComponent.configValidators,
    validConfigurations: [
      { stickyConversationSession: true },
      { stickyConversationSession: false },
      { streamTimeout: 10000 },
      { streamTimeout: 20000 },
      { stickyConversationSession: true, streamTimeout: 10000 },
      {}
    ],
    invalidConfigurations: [
      { stickyConversationSession: "invalid" },
      { stickyConversationSession: 123 },
      { streamTimeout: "invalid" },
      { streamTimeout: -1 },
      { streamTimeout: 1.5 }
    ],
    defaultValues: {
      stickyConversationSession: false,
      streamTimeout: 10000
    }
  });
});