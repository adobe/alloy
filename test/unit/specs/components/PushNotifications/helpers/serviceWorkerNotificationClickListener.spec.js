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

/* eslint-disable no-underscore-dangle */

import { vi, beforeEach, describe, it, expect } from "vitest";

vi.mock(
  "../../../../../../src/components/PushNotifications/request/makeSendServiceWorkerTrackingData.js",
);

import serviceWorkerNotificationClickListener from "../../../../../../src/components/PushNotifications/helpers/serviceWorkerNotificationClickListener.js";
import makeSendServiceWorkerTrackingData from "../../../../../../src/components/PushNotifications/request/makeSendServiceWorkerTrackingData.js";

describe("serviceWorkerNotificationClickListener", () => {
  let mockEvent;
  let mockSw;
  let mockLogger;
  let mockFetch;
  let mockClient;
  let mockWaitUntil;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      url: "https://example.com/page",
      focus: vi.fn().mockResolvedValue(undefined),
    };

    mockSw = {
      clients: {
        matchAll: vi.fn().mockResolvedValue([mockClient]),
        openWindow: vi.fn().mockResolvedValue(mockClient),
      },
    };

    mockLogger = {
      error: vi.fn(),
    };

    mockFetch = vi.fn();
    mockWaitUntil = vi.fn();

    mockEvent = {
      notification: {
        close: vi.fn(),
        data: {
          _xdm: {
            mixins: {
              testMixin: "testValue",
            },
          },
        },
      },
      action: null,
      waitUntil: mockWaitUntil,
    };

    vi.mocked(makeSendServiceWorkerTrackingData).mockResolvedValue(true);
  });

  describe("tracking data sending", () => {
    it("sends tracking data with application launches when no action is taken", async () => {
      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(makeSendServiceWorkerTrackingData).toHaveBeenCalledWith(
        {
          xdm: mockEvent.notification.data._xdm.mixins,
          actionLabel: null,
          applicationLaunches: 1,
        },
        {
          logger: mockLogger,
          fetch: mockFetch,
        },
      );
    });

    it("sends tracking data with action label when action button is clicked", () => {
      mockEvent.action = "action_0";
      mockEvent.notification.data.actions = {
        buttons: [
          {
            label: "View Details",
            type: "WEBURL",
            uri: "https://example.com/details",
          },
        ],
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(makeSendServiceWorkerTrackingData).toHaveBeenCalledWith(
        {
          xdm: mockEvent.notification.data._xdm.mixins,
          actionLabel: "View Details",
          applicationLaunches: 1,
        },
        {
          logger: mockLogger,
          fetch: mockFetch,
        },
      );
    });

    it("logs error when tracking data sending fails", async () => {
      const testError = new Error("Network error");
      vi.mocked(makeSendServiceWorkerTrackingData).mockRejectedValue(testError);

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to send tracking call:",
        testError,
      );
    });
  });

  describe("action button handling", () => {
    it("handles action button with WEBURL type", async () => {
      mockEvent.action = "action_2";
      mockEvent.notification.data.actions = {
        buttons: [
          { label: "First", type: "WEBURL", uri: "https://first.com" },
          { label: "Second", type: "DEEPLINK", uri: "https://second.com" },
          { label: "Third", type: "WEBURL", uri: "https://third.com" },
        ],
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      const waitUntilCallback = mockWaitUntil.mock.calls[0][0];
      await waitUntilCallback;

      expect(mockSw.clients.openWindow).toHaveBeenCalledWith(
        "https://third.com",
      );
    });

    it("handles action button with DEEPLINK type", async () => {
      mockEvent.action = "action_1";
      mockEvent.notification.data.actions = {
        buttons: [
          { label: "First", type: "WEBURL", uri: "https://first.com" },
          { label: "Second", type: "DEEPLINK", uri: "https://second.com" },
          { label: "Third", type: "WEBURL", uri: "https://third.com" },
        ],
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      const waitUntilCallback = mockWaitUntil.mock.calls[0][0];
      await waitUntilCallback;

      expect(mockSw.clients.openWindow).toHaveBeenCalledWith(
        "https://second.com",
      );
    });

    it("ignores action button with unsupported type", () => {
      mockEvent.action = "action_1";
      mockEvent.notification.data.actions = {
        buttons: [
          { label: "First", type: "WEBURL", uri: "https://first.com" },
          { label: "Second", type: "UNSUPPORTED", uri: "https://second.com" },
          { label: "Third", type: "WEBURL", uri: "https://third.com" },
        ],
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(mockWaitUntil).not.toHaveBeenCalled();
    });
  });

  describe("main notification interaction handling", () => {
    it("handles main notification click with WEBURL interaction", () => {
      mockEvent.notification.data.interaction = {
        type: "WEBURL",
        uri: "https://example.com/main",
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(mockWaitUntil).toHaveBeenCalled();
    });

    it("handles main notification click with DEEPLINK interaction", () => {
      mockEvent.notification.data.interaction = {
        type: "DEEPLINK",
        uri: "myapp://main/path",
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(mockWaitUntil).toHaveBeenCalled();
    });

    it("ignores main notification click with unsupported interaction type", () => {
      mockEvent.notification.data.interaction = {
        type: "UNSUPPORTED",
        uri: "https://example.com/main",
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(mockWaitUntil).not.toHaveBeenCalled();
    });

    it("handles main notification without interaction", () => {
      delete mockEvent.notification.data.interaction;

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      expect(mockWaitUntil).not.toHaveBeenCalled();
    });
  });

  describe("client window management", () => {
    it("focuses existing client window with matching URL", async () => {
      mockEvent.notification.data.interaction = {
        type: "WEBURL",
        uri: "https://example.com/page",
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      const waitUntilCallback = mockWaitUntil.mock.calls[0][0];
      await waitUntilCallback;

      expect(mockSw.clients.matchAll).toHaveBeenCalledWith({ type: "window" });
      expect(mockClient.focus).toHaveBeenCalled();
      expect(mockSw.clients.openWindow).not.toHaveBeenCalled();
    });

    it("opens new window when no matching client found", async () => {
      mockClient.url = "https://different.com/page";
      mockEvent.notification.data.interaction = {
        type: "WEBURL",
        uri: "https://example.com/new-page",
      };

      serviceWorkerNotificationClickListener({
        event: mockEvent,
        sw: mockSw,
        logger: mockLogger,
        fetch: mockFetch,
      });

      const waitUntilCallback = mockWaitUntil.mock.calls[0][0];
      await waitUntilCallback;

      expect(mockSw.clients.matchAll).toHaveBeenCalledWith({ type: "window" });
      expect(mockClient.focus).not.toHaveBeenCalled();
      expect(mockSw.clients.openWindow).toHaveBeenCalledWith(
        "https://example.com/new-page",
      );
    });
  });
});
