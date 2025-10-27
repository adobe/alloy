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
import { describe, it, expect, beforeEach } from "vitest";
import injectAdobeAnalyticsReferrer from "../../../../../src/components/Context/injectReferrer.js";

describe("Context::injectAdobeAnalyticsReferrer", () => {
  let mockWindow;
  let xdm;
  let data;
  let mockEvent;

  beforeEach(() => {
    mockWindow = {
      document: {
        referrer: "https://www.google.com/search?q=test",
      },
    };
    xdm = {};
    data = {};
  });

  it("includes referrer on first page view event", () => {
    mockEvent = {
      getContent: () => ({
        xdm: {
          eventType: "web.webpagedetails.pageViews",
        },
      }),
    };

    const context = injectAdobeAnalyticsReferrer(mockWindow);
    context(xdm, data, mockEvent);

    expect(data).toEqual({
      __adobe: {
        analytics: {
          referrer: "https://www.google.com/search?q=test",
        },
      },
    });
  });

  it("includes empty string referrer on subsequent page view events", () => {
    mockEvent = {
      getContent: () => ({
        xdm: {
          eventType: "web.webpagedetails.pageViews",
        },
      }),
    };

    const context = injectAdobeAnalyticsReferrer(mockWindow);

    context(xdm, data, mockEvent);
    expect(data.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    const data2 = {};
    context(xdm, data2, mockEvent);
    expect(data2.__adobe.analytics.referrer).toBe("");

    const data3 = {};
    context(xdm, data3, mockEvent);
    expect(data3.__adobe.analytics.referrer).toBe("");
  });

  it("does not include referrer on decisioning.propositionFetch events", () => {
    mockEvent = {
      getContent: () => ({
        xdm: {
          eventType: "decisioning.propositionFetch",
        },
      }),
    };

    const context = injectAdobeAnalyticsReferrer(mockWindow);
    context(xdm, data, mockEvent);

    expect(data).toEqual({});
  });

  it("includes referrer on first non-decisioning event after decisioning.propositionFetch", () => {
    const context = injectAdobeAnalyticsReferrer(mockWindow);

    const decisioningEvent = {
      getContent: () => ({
        xdm: {
          eventType: "decisioning.propositionFetch",
        },
      }),
    };
    context(xdm, data, decisioningEvent);
    expect(data).toEqual({});

    const pageViewEvent = {
      getContent: () => ({
        xdm: {
          eventType: "web.webpagedetails.pageViews",
        },
      }),
    };
    const data2 = {};
    context(xdm, data2, pageViewEvent);
    expect(data2.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );
  });

  it("handles events without eventType", () => {
    mockEvent = {
      getContent: () => ({
        xdm: {},
      }),
    };

    const context = injectAdobeAnalyticsReferrer(mockWindow);
    context(xdm, data, mockEvent);

    expect(data).toEqual({
      __adobe: {
        analytics: {
          referrer: "https://www.google.com/search?q=test",
        },
      },
    });
  });

  it("handles empty referrer", () => {
    mockWindow.document.referrer = "";
    mockEvent = {
      getContent: () => ({
        xdm: {
          eventType: "web.webpagedetails.pageViews",
        },
      }),
    };

    const context = injectAdobeAnalyticsReferrer(mockWindow);
    context(xdm, data, mockEvent);

    expect(data).toEqual({
      __adobe: {
        analytics: {
          referrer: "",
        },
      },
    });
  });

  it("automatically detects referrer change for SPA view changes", () => {
    const context = injectAdobeAnalyticsReferrer(mockWindow);

    const firstEvent = {
      getContent: () => ({
        xdm: {
          eventType: "web.webpagedetails.pageViews",
        },
      }),
    };
    context(xdm, data, firstEvent);
    expect(data.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    const data2 = {};
    context(xdm, data2, firstEvent);
    expect(data2.__adobe.analytics.referrer).toBe("");

    mockWindow.document.referrer = "https://example.com/page1";
    const data3 = {};
    context(xdm, data3, firstEvent);
    expect(data3.__adobe.analytics.referrer).toBe("https://example.com/page1");

    const data4 = {};
    context(xdm, data4, firstEvent);
    expect(data4.__adobe.analytics.referrer).toBe("");
  });

  it("handles referrer changing from empty to non-empty", () => {
    mockWindow.document.referrer = "";
    const context = injectAdobeAnalyticsReferrer(mockWindow);

    const firstEvent = {
      getContent: () => ({
        xdm: {
          eventType: "web.webpagedetails.pageViews",
        },
      }),
    };
    context(xdm, data, firstEvent);
    expect(data.__adobe.analytics.referrer).toBe("");

    const data2 = {};
    context(xdm, data2, firstEvent);
    expect(data2.__adobe.analytics.referrer).toBe("");

    mockWindow.document.referrer = "https://www.google.com/search?q=test";
    const data3 = {};
    context(xdm, data3, firstEvent);
    expect(data3.__adobe.analytics.referrer).toBe(
      "https://www.google.com/search?q=test",
    );

    const data4 = {};
    context(xdm, data4, firstEvent);
    expect(data4.__adobe.analytics.referrer).toBe("");
  });
});

