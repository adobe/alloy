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

import { describe, it, expect } from "vitest";
import createPushNotifications from "../../../../../src/components/PushNotifications/index.js";

describe("PushNotifications configValidators", () => {
  it("should allow empty config when pushNotifications is not provided", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({});
    }).not.toThrow();
  });

  it("should throw when pushNotifications is empty object", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {},
      });
    }).toThrow();
  });

  it("should throw when only vapidPublicKey is provided", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
        },
      });
    }).toThrow();
  });

  it("should throw when only appId is provided", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          appId: "test-app",
        },
      });
    }).toThrow();
  });

  it("should not throw when all required fields are provided", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: "test-app",
          trackingDatasetId: "test-dataset",
        },
      });
    }).not.toThrow();
  });

  it("should throw when vapidPublicKey is not a string", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: 123,
          appId: "test-app",
          trackingDatasetId: "test-dataset",
        },
      });
    }).toThrow();
  });

  it("should throw when appId is not a string", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: 123,
          trackingDatasetId: "test-dataset",
        },
      });
    }).toThrow();
  });

  it("should throw when trackingDatasetId is not a string", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: "test-app",
          trackingDatasetId: 123,
        },
      });
    }).toThrow();
  });

  it("should throw when trackingDatasetId is missing", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: "test-app",
        },
      });
    }).toThrow();
  });

  it("should throw when unknown fields are provided", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: "test-app",
          trackingDatasetId: "test-dataset",
          unknownField: "value",
        },
      });
    }).toThrow();
  });
});
