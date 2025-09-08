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

  it("should require both vapidPublicKey and appId when pushNotifications is provided", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {},
      });
    }).toThrow();

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
        },
      });
    }).toThrow();

    expect(() => {
      configValidators({
        pushNotifications: {
          appId: "test-app",
        },
      });
    }).toThrow();

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: "test-app",
        },
      });
    }).not.toThrow();
  });

  it("should reject non-string values", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: 123,
          appId: "test-app",
        },
      });
    }).toThrow();

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: 123,
        },
      });
    }).toThrow();
  });

  it("should reject unknown fields", () => {
    const { configValidators } = createPushNotifications;

    expect(() => {
      configValidators({
        pushNotifications: {
          vapidPublicKey: "test-key",
          appId: "test-app",
          unknownField: "value",
        },
      });
    }).toThrow();
  });
});
