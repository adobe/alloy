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
  "../../../../../../src/components/PushNotifications/helpers/readFromIndexedDb.js",
);
vi.mock("../../../../../../src/utils/uuid.js");

import makeSendServiceWorkerTrackingData from "../../../../../../src/components/PushNotifications/request/makeSendServiceWorkerTrackingData.js";
import readFromIndexedDb from "../../../../../../src/components/PushNotifications/helpers/readFromIndexedDb.js";
import uuidv4 from "../../../../../../src/utils/uuid.js";

describe("makeSendServiceWorkerTrackingData", () => {
  let mockLogger;
  let mockFetch;
  let mockConfigData;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLogger = {
      error: vi.fn(),
    };

    mockFetch = vi.fn();

    mockConfigData = {
      browser: "Chrome",
      ecid: "test-ecid-12345",
      edgeDomain: "edge.adobedc.net",
      edgeBasePath: "ee",
      datastreamId: "test-datastream-id",
      datasetId: "test-dataset-id",
    };

    vi.mocked(readFromIndexedDb).mockResolvedValue(mockConfigData);
    vi.mocked(uuidv4).mockReturnValue("mock-uuid-1234");
  });

  describe("successful tracking data sending", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
      });
    });

    it("sends tracking data for application opened event", async () => {
      const xdm = {
        _experience: {
          customerJourneyManagement: {
            existingData: "test",
          },
        },
      };

      const result = await makeSendServiceWorkerTrackingData(
        { xdm, applicationLaunches: 1 },
        { logger: mockLogger, fetch: mockFetch },
      );

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://edge.adobedc.net/ee/v1/interact?configId=test-datastream-id&requestId=mock-uuid-1234",
        {
          method: "POST",
          headers: {
            "content-type": "text/plain; charset=UTF-8",
          },
          body: expect.stringContaining(
            '"eventType":"pushTracking.applicationOpened"',
          ),
        },
      );

      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);

      expect(payload.events[0].xdm.identityMap.ECID[0].id).toBe(
        "test-ecid-12345",
      );
      expect(payload.events[0].xdm.pushNotificationTracking.pushProvider).toBe(
        "chrome",
      );
      expect(
        payload.events[0].xdm.pushNotificationTracking.pushProviderMessageID,
      ).toBe("mock-uuid-1234");
      expect(payload.events[0].xdm.application.launches.value).toBe(1);
      expect(
        payload.events[0].xdm._experience.customerJourneyManagement
          .existingData,
      ).toBe("test");
      expect(
        payload.events[0].xdm._experience.customerJourneyManagement
          .pushChannelContext.platform,
      ).toBe("web");
      expect(payload.events[0].meta.collect.datasetId).toBe("test-dataset-id");
    });

    it("sends tracking data for custom action event", async () => {
      const xdm = {
        _experience: {
          customerJourneyManagement: {},
        },
      };

      const result = await makeSendServiceWorkerTrackingData(
        { xdm, actionLabel: "Adobe.com", applicationLaunches: 0 },
        { logger: mockLogger, fetch: mockFetch },
      );

      expect(result).toBe(true);

      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1].body);

      expect(payload.events[0].xdm.eventType).toBe("pushTracking.customAction");
      expect(
        payload.events[0].xdm.pushNotificationTracking.customAction.actionID,
      ).toBe("Adobe.com");
      expect(payload.events[0].xdm.application.launches.value).toBe(0);
    });
  });

  describe("missing required fields", () => {
    const requiredFields = [
      { field: "browser", errorMessage: "Browser" },
      { field: "ecid", errorMessage: "ECID" },
      { field: "edgeDomain", errorMessage: "Edge domain" },
      { field: "edgeBasePath", errorMessage: "Edge base path" },
      { field: "datastreamId", errorMessage: "Datastream ID" },
      { field: "datasetId", errorMessage: "Dataset ID" },
    ];

    requiredFields.forEach(({ field, errorMessage }) => {
      it(`returns false when ${field} is missing`, async () => {
        const incompleteConfigData = { ...mockConfigData };
        delete incompleteConfigData[field];
        vi.mocked(readFromIndexedDb).mockResolvedValue(incompleteConfigData);

        const xdm = {
          _experience: {
            customerJourneyManagement: {},
          },
        };

        const result = await makeSendServiceWorkerTrackingData(
          { xdm },
          { logger: mockLogger, fetch: mockFetch },
        );

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Error sending tracking call:",
          expect.objectContaining({
            message: `Cannot send tracking call. ${errorMessage} is missing.`,
          }),
        );
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });

  it("preserves existing XDM experience data while adding push context", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const xdm = {
      _experience: {
        customerJourneyManagement: {
          existingProperty: "existingValue",
          nestedObject: {
            nestedProp: "nestedValue",
          },
        },
        otherExperienceData: {
          someProperty: "someValue",
        },
      },
    };

    await makeSendServiceWorkerTrackingData(
      { xdm },
      { logger: mockLogger, fetch: mockFetch },
    );

    const callArgs = mockFetch.mock.calls[0];
    const payload = JSON.parse(callArgs[1].body);
    const experienceData = payload.events[0].xdm._experience;

    expect(experienceData.customerJourneyManagement.existingProperty).toBe(
      "existingValue",
    );
    expect(
      experienceData.customerJourneyManagement.nestedObject.nestedProp,
    ).toBe("nestedValue");
    expect(
      experienceData.customerJourneyManagement.pushChannelContext.platform,
    ).toBe("web");
    expect(
      experienceData.customerJourneyManagement.messageProfile.channel._id,
    ).toBe("https://ns.adobe.com/xdm/channels/push");
    expect(experienceData.otherExperienceData.someProperty).toBe("someValue");
  });
});
