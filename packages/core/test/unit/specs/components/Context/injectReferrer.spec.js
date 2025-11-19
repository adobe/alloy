/* eslint-disable no-underscore-dangle */
/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { describe, it, expect, beforeEach, vi } from "vitest";
import injectOneTimeAnalyticsReferrer from "../../../../../src/components/Context/injectOneTimeAnalyticsReferrer.js";

describe("Context::injectOneTimeAnalyticsReferrer", () => {
  let mockWindow;
  let mockEvent;
  let mergedData;

  beforeEach(() => {
    mockWindow = {
      document: {
        referrer: "https://www.google.com/search?q=test",
      },
    };
    mergedData = null;
  });

  const createMockEvent = (eventType = "web.webpagedetails.pageViews", existingData = {}) => {
    return {
      getContent: () => ({
        xdm: { eventType },
        data: existingData,
      }),
      mergeData: vi.fn((data) => {
        mergedData = data;
      }),
    };
  };

  it("includes referrer on first page view event", () => {
    mockEvent = createMockEvent();
    const context = injectOneTimeAnalyticsReferrer(mockWindow);
    context(mockEvent);

    expect(mergedData).toEqual({
      __adobe: {
        analytics: {
          referrer: "https://www.google.com/search?q=test",
        },
      },
    });
  });

  it("includes empty string referrer on subsequent page view events", () => {
    const context = injectOneTimeAnalyticsReferrer(mockWindow);

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");
  });

  it("does not include referrer on decisioning.propositionFetch events", () => {
    mockEvent = createMockEvent("decisioning.propositionFetch");
    const context = injectOneTimeAnalyticsReferrer(mockWindow);
    context(mockEvent);

    expect(mergedData).toBeNull();
  });

  it("includes referrer on first non-decisioning event after decisioning.propositionFetch", () => {
    const context = injectOneTimeAnalyticsReferrer(mockWindow);

    mockEvent = createMockEvent("decisioning.propositionFetch");
    context(mockEvent);
    expect(mergedData).toBeNull();

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );
  });

  it("handles events without eventType", () => {
    mockEvent = createMockEvent(undefined);
    const context = injectOneTimeAnalyticsReferrer(mockWindow);
    context(mockEvent);

    expect(mergedData).toEqual({
      __adobe: {
        analytics: {
          referrer: "https://www.google.com/search?q=test",
        },
      },
    });
  });

  it("handles empty referrer", () => {
    mockWindow.document.referrer = "";
    mockEvent = createMockEvent();
    const context = injectOneTimeAnalyticsReferrer(mockWindow);
    context(mockEvent);

    expect(mergedData).toEqual({
      __adobe: {
        analytics: {
          referrer: "",
        },
      },
    });
  });

  it("automatically detects referrer change for SPA view changes", () => {
    const context = injectOneTimeAnalyticsReferrer(mockWindow);

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");

    mockWindow.document.referrer = "https://example.com/page1";
    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("https://example.com/page1");

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");
  });

  it("handles referrer changing from empty to non-empty", () => {
    mockWindow.document.referrer = "";
    const context = injectOneTimeAnalyticsReferrer(mockWindow);

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");

    mockWindow.document.referrer = "https://www.google.com/search?q=test";
    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");
  });

  it("allows customers to explicitly set referrer for SPA view changes", () => {
    const context = injectOneTimeAnalyticsReferrer(mockWindow);

    mockEvent = createMockEvent();
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    mockEvent = createMockEvent("web.webpagedetails.pageViews", {
      __adobe: {
        analytics: {
          referrer: "/internal-spa-page",
        },
      },
    });
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("/internal-spa-page");

    // Next event with the same explicit referrer should send empty string
    mockEvent = createMockEvent("web.webpagedetails.pageViews", {
      __adobe: {
        analytics: {
          referrer: "/internal-spa-page",
        },
      },
    });
    context(mockEvent);
    expect(mergedData.__adobe.analytics.referrer).toBe("");
  });
});

