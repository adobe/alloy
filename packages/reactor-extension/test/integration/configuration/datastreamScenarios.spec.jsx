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
import { waitForConfigurationViewToLoad } from "../helpers/ui";
import { worker } from "../helpers/mocks/browser";
import { spectrumRadio, spectrumTextField } from "../helpers/form";
import {
  datastreamsForbiddenHandlers,
  datastreamForbiddenHandlers,
  singleSandboxNoDefaultHandlers,
} from "../helpers/mocks/defaultHandlers";

let extensionBridge;

describe("Config Sandboxes", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("does not show alert panel and uses freeform input method with forbidden datastream access", async () => {
    worker.use(...datastreamForbiddenHandlers);

    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            edgeDomain: "custom.example.com",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
          },
        ],
      },
    });
    await waitForConfigurationViewToLoad(view);

    const selectRadio = spectrumRadio("edgeConfigInputMethodFreeformRadio");
    expect(await selectRadio.isSelected()).toBe(true);

    const dataStreamInput = spectrumTextField("productionEnvironmentTextfield");
    expect(await dataStreamInput.getValue()).toBe(
      "2fdb3763-0507-42ea-8856-e91bf3b64faa",
    );

    await expect
      .element(
        view.getByRole("heading", {
          name: /you do not have enough permissions to fetch the organization configurations/i,
        }),
      )
      .not.toBeInTheDocument();
  });

  it("does show a disabled data stream field input with forbidden datastreams access", async () => {
    worker.use(...datastreamsForbiddenHandlers);

    const view = await renderView(ConfigurationView);

    extensionBridge.init({
      settings: {
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy",
            orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            edgeDomain: "custom.example.com",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
        ],
      },
    });
    await waitForConfigurationViewToLoad(view);

    await expect
      .element(
        view.getByText(
          /You do not have enough permissions to fetch the Prod sandbox configurations/i,
        ),
      )
      .toBeInTheDocument();

    const dataStreamInput = spectrumTextField(
      "datastreamDisabledFieldproduction",
    );
    expect(await dataStreamInput.isDisabled()).toBe(true);
    expect(await dataStreamInput.getValue()).toBe(
      "2fdb3763-0507-42ea-8856-e91bf3b64faa",
    );
  });

  it("shows alert panel with one non-default sandbox and forbidden datastreams access", async () => {
    worker.use(
      ...singleSandboxNoDefaultHandlers,
      ...datastreamsForbiddenHandlers,
    );

    const view = await renderView(ConfigurationView);

    extensionBridge.init();
    await waitForConfigurationViewToLoad(view);

    const selectRadio = spectrumRadio("edgeConfigInputMethodSelectRadio");
    await selectRadio.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /you do not have enough permissions to fetch the organization configurations/i,
        }),
      )
      .toBeInTheDocument();
  });
});
