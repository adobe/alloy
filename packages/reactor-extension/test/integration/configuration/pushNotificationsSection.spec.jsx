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

import { describe, it, beforeEach, afterEach, expect } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import configurationUI from "../helpers/ui/configurationUI";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let ui;
let driver;
let cleanup;
let vapidPublicKeyField;
let appIdField;
let trackingDatasetIdField;
let pushNotificationsComponentCheckbox;

describe("Config push notifications section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    ui = configurationUI(view);
    vapidPublicKeyField = field(view.getByTestId("vapidPublicKeyField"));
    appIdField = field(view.getByTestId("appIdField"));
    trackingDatasetIdField = field(view.getByTestId("trackingDatasetIdField"));
    pushNotificationsComponentCheckbox = field(
      view.getByTestId("pushNotificationsComponentCheckbox"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("sets form values from settings", async () => {
    await driver.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },

        instances: [
          {
            name: "alloy",
            pushNotifications: {
              vapidPublicKey: "test-vapid-key",
              appId: "test-app-id",
              trackingDatasetId: "test-dataset-id",
            },
          },
        ],
      }),
    );

    await vapidPublicKeyField.expectValue("test-vapid-key");
    await appIdField.expectValue("test-app-id");
    await trackingDatasetIdField.expectValue("test-dataset-id");
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },
      }),
    );

    await vapidPublicKeyField.fill("new-vapid-key");
    await appIdField.fill("new-app-id");
    await trackingDatasetIdField.fill("new-dataset-id");

    await driver
      .expectSettings((s) => s.instances[0].pushNotifications)
      .toMatchObject({
        vapidPublicKey: "new-vapid-key",
        appId: "new-app-id",
        trackingDatasetId: "new-dataset-id",
      });
  });

  it("does not emit push notifications settings when component is disabled", async () => {
    await driver.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },

        instances: [
          {
            name: "alloy",
            pushNotifications: {
              vapidPublicKey: "test-vapid-key",
              appId: "test-app-id",
              trackingDatasetId: "test-dataset-id",
            },
          },
        ],
      }),
    );

    await ui.expand("Build options");
    await pushNotificationsComponentCheckbox.click();

    await driver
      .expectSettings((s) => s.instances[0].pushNotifications)
      .toBeUndefined();
  });

  it("shows alert panel when push notifications component is disabled", async () => {
    await driver.init(buildSettings());
    await expect
      .element(
        view.getByRole("heading", {
          name: /push notifications component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    await driver.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },
      }),
    );

    await ui.expand("Build options");
    await pushNotificationsComponentCheckbox.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /push notifications component disabled/i,
        }),
      )
      .toBeVisible();
  });

  describe("validation", () => {
    it("requires VAPID public key", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);
      await ui.expand("Build options");
      await pushNotificationsComponentCheckbox.click();

      await appIdField.fill("test-app-id");
      await trackingDatasetIdField.fill("test-dataset-id");
      await vapidPublicKeyField.clear();

      await driver.expectValidate().toBe(false);

      await vapidPublicKeyField.expectError(
        /please provide a vapid public key/i,
      );
    });

    it("requires application ID", async () => {
      await driver.init(buildSettings());

      await ui.expand("Build options");
      await pushNotificationsComponentCheckbox.click();

      await vapidPublicKeyField.fill("test-vapid-key");
      await trackingDatasetIdField.fill("test-dataset-id");
      await appIdField.clear();

      await driver.expectValidate().toBe(false);

      await appIdField.expectError(/please provide an application id/i);
    });

    it("requires tracking dataset ID", async () => {
      await driver.init(buildSettings());

      await ui.expand("Build options");
      await pushNotificationsComponentCheckbox.click();

      await vapidPublicKeyField.fill("test-vapid-key");
      await appIdField.fill("test-app-id");
      await trackingDatasetIdField.clear();

      await driver.expectValidate().toBe(false);

      await trackingDatasetIdField.expectError(
        /please provide a tracking dataset id/i,
      );
    });
  });
});
