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

import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad, toggleComponent } from "../helpers/ui";
import { spectrumTextField, spectrumComboBox } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";
import { worker } from "../helpers/mocks/browser";
import {
  noAdvertisersHandlers,
  advertisersUnauthorizedHandlers,
} from "../helpers/mocks/defaultHandlers";

/**
 * Wait for advertiser fields to load after enabling DSP
 */
const waitForAdvertisersToLoad = async (view) => {
  // Wait for the advertiser field to appear (indicates advertisers are loaded)
  await expect
    .element(view.getByTestId("advertiser0Field"))
    .toBeInTheDocument({ timeout: 10000 });
};

/**
 * Wait for ID5 and RampID fields to appear (they show after advertisers load)
 */
const waitForOptionalFieldsToLoad = async (view) => {
  // Wait for ID5 field to appear
  await expect
    .element(view.getByTestId("id5PartnerIdField"))
    .toBeInTheDocument({ timeout: 10000 });
};

let extensionBridge;

describe("Config advertising section", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("sets form values from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              advertiserSettings: [
                {
                  advertiserId: "167534",
                  enabled: true,
                },
              ],
              id5PartnerId: "test-id5-partner",
              rampIdJSPath: "https://example.com/ats.js",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    expect(await dspEnabledField.getValue()).toBe("Enabled");

    const id5PartnerIdField = spectrumTextField("id5PartnerIdField");
    expect(await id5PartnerIdField.getValue()).toBe("test-id5-partner");

    const rampIdJSPathField = spectrumTextField("rampIdJSPathField");
    expect(await rampIdJSPathField.getValue()).toBe(
      "https://example.com/ats.js",
    );
  });

  it("sets form values from settings with DSP disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: false,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    expect(await dspEnabledField.getValue()).toBe("Disabled");
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for advertisers to load after enabling DSP
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    const advertiserIdField = spectrumComboBox("advertiser0Field");
    await advertiserIdField.selectOption("test");

    const id5PartnerIdField = spectrumTextField("id5PartnerIdField");
    await id5PartnerIdField.fill("new-id5-partner");

    const rampIdJSPathField = spectrumTextField("rampIdJSPathField");
    await rampIdJSPathField.fill("https://new.example.com/ats.js");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising).toMatchObject({
      dspEnabled: true,
      id5PartnerId: "new-id5-partner",
      rampIdJSPath: "https://new.example.com/ats.js",
      advertiserSettings: [
        {
          advertiserId: "167536",
          enabled: true,
        },
      ],
    });
  });

  it("does not emit advertising settings when component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              advertiserSettings: [
                {
                  advertiserId: "167536",
                  enabled: true,
                },
              ],
              id5PartnerId: "test-id5-partner",
              rampIdJSPath: "https://example.com/ats.js",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("advertising");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising).toBeUndefined();
  });

  it("shows alert panel when advertising component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());
    await waitForConfigurationViewToLoad(view);

    await expect
      .element(
        view.getByRole("heading", {
          name: /adobe advertising component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("advertising");

    // Should now show alert panel
    await expect
      .element(
        view.getByRole("heading", {
          name: /adobe advertising component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("allows data element in DSP enabled field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: "%myDataElement%",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    expect(await dspEnabledField.getValue()).toBe("%myDataElement%");

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.dspEnabled).toBe(
      "%myDataElement%",
    );
  });

  it("allows data element in ID5 Partner ID field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              id5PartnerId: "%id5DataElement%",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    const id5PartnerIdField = spectrumTextField("id5PartnerIdField");
    expect(await id5PartnerIdField.getValue()).toBe("%id5DataElement%");

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.id5PartnerId).toBe(
      "%id5DataElement%",
    );
  });

  it("allows data element in RampID JS Path field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              rampIdJSPath: "%rampIdDataElement%",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    const rampIdJSPathField = spectrumTextField("rampIdJSPathField");
    expect(await rampIdJSPathField.getValue()).toBe("%rampIdDataElement%");

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.rampIdJSPath).toBe(
      "%rampIdDataElement%",
    );
  });

  it("does not save optional fields when empty", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for advertisers to load
    await waitForAdvertisersToLoad(view);

    // Leave optional fields empty
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.id5PartnerId).toBeUndefined();
    expect(settings.instances[0].advertising.rampIdJSPath).toBeUndefined();
  });

  it("shows default DSP disabled value when no settings provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    expect(await dspEnabledField.getValue()).toBe("Disabled");
  });

  it("converts boolean dspEnabled to string for UI display", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    expect(await dspEnabledField.getValue()).toBe("Enabled");
  });

  it("converts Enabled string to boolean true when saving", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for advertisers to load
    await waitForAdvertisersToLoad(view);

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.dspEnabled).toBe(true);
  });

  it("converts Disabled string to boolean false when saving", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Disabled");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.dspEnabled).toBe(false);
  });

  it("hides DSP fields when DSP is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    expect(await dspEnabledField.getValue()).toBe("Disabled");

    // Verify DSP-specific fields are not visible
    await expect
      .element(view.getByTestId("addAdvertiserButton"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("id5PartnerIdField"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("rampIdJSPathField"))
      .not.toBeInTheDocument();
  });

  it("shows DSP fields when DSP is enabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for advertisers to load
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    // Verify DSP-specific fields are now visible
    await expect
      .element(view.getByTestId("addAdvertiserButton"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("id5PartnerIdField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("rampIdJSPathField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("advertiser0Field"))
      .toBeInTheDocument();
  });

  it("shows warning alert when no advertisers are found but allows manual entry", async () => {
    // Override the default handler with no advertisers response
    worker.use(...noAdvertisersHandlers);

    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for the warning alert to appear
    await expect
      .element(
        view.getByRole("heading", {
          name: /no dsp advertisers found/i,
        }),
      )
      .toBeVisible({ timeout: 5000 });

    // Verify the alert content
    await expect
      .element(view.getByText(/no advertisers found for this ims org/i))
      .toBeVisible();

    // Verify DSP fields are now visible for manual entry
    await expect.element(view.getByTestId("addAdvertiserButton")).toBeVisible();
    await expect.element(view.getByTestId("id5PartnerIdField")).toBeVisible();
    await expect.element(view.getByTestId("rampIdJSPathField")).toBeVisible();

    // Verify form is invalid without advertiser ID
    expect(await extensionBridge.validate()).toBe(false);
  });

  it("shows warning alert when advertiser API fails but allows manual entry", async () => {
    // Override the default handler with unauthorized response
    worker.use(...advertisersUnauthorizedHandlers);

    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for the warning alert to appear
    await expect
      .element(
        view.getByRole("heading", {
          name: /unable to load advertisers/i,
        }),
      )
      .toBeVisible({ timeout: 5000 });

    // Verify the alert content
    await expect
      .element(view.getByText(/could not retrieve advertiser data from dsp/i))
      .toBeVisible();

    // Verify DSP fields are now visible for manual entry
    await expect.element(view.getByTestId("addAdvertiserButton")).toBeVisible();
    await expect.element(view.getByTestId("id5PartnerIdField")).toBeVisible();
    await expect.element(view.getByTestId("rampIdJSPathField")).toBeVisible();

    // Verify form is invalid without advertiser ID
    expect(await extensionBridge.validate()).toBe(false);
  });

  it("shows add advertiser button when advertisers load successfully", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for advertisers to load
    await waitForAdvertisersToLoad(view);

    // Verify add advertiser button is visible
    await expect
      .element(view.getByTestId("addAdvertiserButton"))
      .toBeInTheDocument();

    // Verify one advertiser row is visible by default
    await expect
      .element(view.getByTestId("advertiser0Field"))
      .toBeInTheDocument();
  });

  it("allows adding multiple advertisers", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const dspEnabledField = spectrumComboBox("dspEnabledField");
    await dspEnabledField.fill("Enabled");

    // Wait for advertisers to load
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    // Select first advertiser
    const advertiser0Field = spectrumComboBox("advertiser0Field");
    await advertiser0Field.selectOption("test");

    // Add second advertiser
    const addAdvertiserButton = view.getByTestId("addAdvertiserButton");
    await addAdvertiserButton.click();

    // Select second advertiser
    const advertiser1Field = spectrumComboBox("advertiser1Field");
    await advertiser1Field.selectOption("Advertiser BF");

    // Verify settings
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.advertiserSettings).toHaveLength(
      2,
    );
    expect(
      settings.instances[0].advertising.advertiserSettings[0],
    ).toMatchObject({
      advertiserId: "167536",
      enabled: true,
    });
    expect(
      settings.instances[0].advertising.advertiserSettings[1],
    ).toMatchObject({
      advertiserId: "167524",
      enabled: true,
    });
  });

  it("allows removing advertisers", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              advertiserSettings: [
                {
                  advertiserId: "167534",
                  enabled: true,
                },
                {
                  advertiserId: "167524",
                  enabled: true,
                },
              ],
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    // Remove first advertiser
    const removeButton0 = view.getByTestId("deleteAdvertiser0Button");
    await removeButton0.click();

    // Verify settings
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].advertising.advertiserSettings).toHaveLength(
      1,
    );
    expect(
      settings.instances[0].advertising.advertiserSettings[0],
    ).toMatchObject({
      advertiserId: "167524",
      enabled: true,
    });
  });

  it("allows toggling advertiser enabled state", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
        },

        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              advertiserSettings: [
                {
                  advertiserId: "167534",
                  enabled: true,
                },
              ],
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await waitForAdvertisersToLoad(view);
    await waitForOptionalFieldsToLoad(view);

    // Toggle to disabled
    const advertiserEnabled0Field = spectrumComboBox("advertiserEnabled0Field");
    await advertiserEnabled0Field.fill("Disabled");

    // Verify settings
    let settings = await extensionBridge.getSettings();
    expect(
      settings.instances[0].advertising.advertiserSettings[0].enabled,
    ).toBe(false);

    // Toggle back to enabled
    await advertiserEnabled0Field.fill("Enabled");

    // Verify settings
    settings = await extensionBridge.getSettings();
    expect(
      settings.instances[0].advertising.advertiserSettings[0].enabled,
    ).toBe(true);
  });

  describe("validation", () => {
    it("requires DSP enabled field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          components: {
            advertising: true,
          },
        }),
      );

      await waitForConfigurationViewToLoad(view);

      const dspEnabledField = spectrumComboBox("dspEnabledField");
      await dspEnabledField.fill("");

      expect(await extensionBridge.validate()).toBe(false);

      // Check that the field shows an error
      expect(await dspEnabledField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await dspEnabledField.getErrorMessage();
      expect(errorMessage).toBe(
        "Please choose a value or specify a data element.",
      );
    });

    it("validates data element format in DSP enabled field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          components: {
            advertising: true,
          },

          instances: [
            {
              name: "alloy",
              advertising: {
                dspEnabled: "invalid%dataElement",
                advertiserSettings: [
                  {
                    advertiserId: "167534",
                    enabled: "Enabled",
                  },
                ],
              },
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      // Trigger validation
      expect(await extensionBridge.validate()).toBe(false);

      // Wait a bit for the error to appear in the DOM
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Check that the field shows an error
      const dspEnabledField = spectrumComboBox("dspEnabledField");
      expect(await dspEnabledField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await dspEnabledField.getErrorMessage();
      expect(errorMessage).toBe("Please enter a valid data element.");
    });

    it("accepts valid data element format in DSP enabled field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          components: {
            advertising: true,
          },

          instances: [
            {
              name: "alloy",
              advertising: {
                dspEnabled: "%validDataElement%",
                advertiserSettings: [
                  {
                    advertiserId: "167534",
                    enabled: "Enabled",
                  },
                ],
              },
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      // When DSP is a data element, advertisers will still load
      await waitForAdvertisersToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      // Check that the field does not show an error
      const dspEnabledField = spectrumComboBox("dspEnabledField");
      expect(await dspEnabledField.hasError()).toBe(false);
    });

    it("validates data element format in ID5 Partner ID field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          components: {
            advertising: true,
          },

          instances: [
            {
              name: "alloy",
              advertising: {
                dspEnabled: true,
                id5PartnerId: "invalid%dataElement",
                advertiserSettings: [
                  {
                    advertiserId: "167534",
                    enabled: "Enabled",
                  },
                ],
              },
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);
      await waitForAdvertisersToLoad(view);
      await waitForOptionalFieldsToLoad(view);

      // Trigger validation
      expect(await extensionBridge.validate()).toBe(false);

      // Wait a bit for the error to appear in the DOM
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Check that the field shows an error
      const id5PartnerIdField = spectrumTextField("id5PartnerIdField");
      expect(await id5PartnerIdField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await id5PartnerIdField.getErrorMessage();
      expect(errorMessage).toBe("Please enter a valid data element.");
    });

    it("validates data element format in RampID JS Path field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          components: {
            advertising: true,
          },

          instances: [
            {
              name: "alloy",
              advertising: {
                dspEnabled: true,
                rampIdJSPath: "invalid%dataElement",
                advertiserSettings: [
                  {
                    advertiserId: "167534",
                    enabled: "Enabled",
                  },
                ],
              },
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);
      await waitForAdvertisersToLoad(view);
      await waitForOptionalFieldsToLoad(view);

      // Trigger validation
      expect(await extensionBridge.validate()).toBe(false);

      // Wait a bit for the error to appear in the DOM
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Check that the field shows an error
      const rampIdJSPathField = spectrumTextField("rampIdJSPathField");
      expect(await rampIdJSPathField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await rampIdJSPathField.getErrorMessage();
      expect(errorMessage).toBe("Please enter a valid data element.");
    });

    it("shows error when advertiser field is missing while DSP is enabled", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          components: {
            advertising: true,
          },

          instances: [
            {
              name: "alloy",
              advertising: {
                dspEnabled: true,
                advertiserSettings: [],
              },
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);
      await waitForAdvertisersToLoad(view);

      // Trigger validation
      expect(await extensionBridge.validate()).toBe(false);

      // Wait a bit for the error to appear in the DOM
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Check that the advertiser field shows an error
      const advertiserField = spectrumComboBox("advertiser0Field");
      expect(await advertiserField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await advertiserField.getErrorMessage();
      expect(errorMessage).toBe("Please select an advertiser.");
    });
  });
});
