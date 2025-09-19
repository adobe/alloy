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

import serviceWorkerPushListener from "../../../../../../src/components/PushNotifications/helpers/serviceWorkerPushListener.js";

describe("serviceWorkerPushListener", () => {
  let mockSw;
  let mockEvent;
  let mockLogger;
  let mockShowNotification;

  beforeEach(() => {
    vi.clearAllMocks();

    mockShowNotification = vi.fn().mockResolvedValue(undefined);

    mockSw = {
      registration: {
        showNotification: mockShowNotification,
      },
    };

    mockLogger = {
      error: vi.fn(),
    };

    mockEvent = {
      data: {
        json: vi.fn(),
      },
    };
  });

  describe("early returns", () => {
    it("returns early when event has no data", async () => {
      mockEvent.data = null;

      const result = await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(result).toBeUndefined();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it("returns early when JSON parsing fails", async () => {
      const parseError = new Error("JSON parse error");
      mockEvent.data.json.mockImplementation(() => {
        throw parseError;
      });

      const result = await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(result).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error decoding notification JSON data:",
        parseError,
      );
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it("returns early when web data is missing", async () => {
      mockEvent.data.json.mockReturnValue({});

      const result = await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(result).toBeUndefined();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it("returns early when web data has no title", async () => {
      mockEvent.data.json.mockReturnValue({
        web: {
          body: "Test body",
        },
      });

      const result = await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(result).toBeUndefined();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });

    it("returns early when web data title is empty string", async () => {
      mockEvent.data.json.mockReturnValue({
        web: {
          title: "",
          body: "Test body",
        },
      });

      const result = await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(result).toBeUndefined();
      expect(mockShowNotification).not.toHaveBeenCalled();
    });
  });

  describe("basic notification display", () => {
    it("shows notification with minimal required data", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        data: notificationData.web,
        actions: [],
      });
    });

    it("shows notification with all optional fields", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
          body: "Test body",
          media: "https://example.com/icon.png",
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        body: "Test body",
        icon: "https://example.com/icon.png",
        image: "https://example.com/icon.png",
        data: notificationData.web,
        actions: [],
      });
    });
  });

  describe("null value cleanup", () => {
    it("removes null values from notification options", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
          body: null,
          media: "https://example.com/icon.png",
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        icon: "https://example.com/icon.png",
        image: "https://example.com/icon.png",
        data: notificationData.web,
        actions: [],
      });
    });

    it("removes undefined values from notification options", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
          body: "Test body",
          media: undefined,
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        body: "Test body",
        data: notificationData.web,
        actions: [],
      });
    });
  });

  describe("action buttons", () => {
    it("processes action buttons correctly", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
          body: "Test body",
          actions: {
            buttons: [
              { label: "First Button" },
              { label: "Second Button" },
              { label: "Third Button" },
            ],
          },
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        body: "Test body",
        data: notificationData.web,
        actions: [
          { action: "action_0", title: "First Button" },
          { action: "action_1", title: "Second Button" },
          { action: "action_2", title: "Third Button" },
        ],
      });
    });

    it("handles empty actions array", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
          actions: {
            buttons: [],
          },
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        data: notificationData.web,
        actions: [],
      });
    });

    it("handles missing actions.buttons", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
          actions: {},
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        data: notificationData.web,
        actions: [],
      });
    });

    it("handles missing actions property", async () => {
      const notificationData = {
        web: {
          title: "Test Title",
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Test Title", {
        data: notificationData.web,
        actions: [],
      });
    });
  });

  describe("return value", () => {
    it("returns the promise from showNotification", async () => {
      const notificationPromise = Promise.resolve("notification result");
      mockShowNotification.mockReturnValue(notificationPromise);

      const notificationData = {
        web: {
          title: "Test Title",
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      const result = await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(result).toBe("notification result");
    });
  });

  describe("complex scenarios", () => {
    it("handles notification with all features combined", async () => {
      const notificationData = {
        web: {
          title: "Complex Notification",
          body: "This is a complex notification",
          media: "https://example.com/notification.jpg",
          actions: {
            buttons: [{ label: "View Details" }, { label: "Dismiss" }],
          },
          customData: "additional data",
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith(
        "Complex Notification",
        {
          body: "This is a complex notification",
          icon: "https://example.com/notification.jpg",
          image: "https://example.com/notification.jpg",
          data: notificationData.web,
          actions: [
            { action: "action_0", title: "View Details" },
            { action: "action_1", title: "Dismiss" },
          ],
        },
      );
    });

    it("handles single action button", async () => {
      const notificationData = {
        web: {
          title: "Single Action",
          actions: {
            buttons: [{ label: "Action" }],
          },
        },
      };
      mockEvent.data.json.mockReturnValue(notificationData);

      await serviceWorkerPushListener({
        sw: mockSw,
        event: mockEvent,
        logger: mockLogger,
      });

      expect(mockShowNotification).toHaveBeenCalledWith("Single Action", {
        data: notificationData.web,
        actions: [{ action: "action_0", title: "Action" }],
      });
    });
  });
});
