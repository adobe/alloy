/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { http, HttpResponse, delay } from "msw";
import { userEvent } from "vitest/browser";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { worker } from "../helpers/mocks/browser";
import {
  datastreamsForbiddenHandlers,
  sandboxUserRegionMissingHandlers,
} from "../helpers/mocks/defaultHandlers";
import field from "../helpers/field";

const SANDBOXES_URL =
  "https://platform.adobe.io/data/foundation/sandbox-management/";
const DATASTREAMS_URL =
  "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/";

const ANALYTICS_ENABLED_ID = "2fdb3763-0507-42ea-8856-e91bf3b64faa";
const AEP_EDGE_SAMPLES_ID = "0a106b4d-1937-4196-a64d-4a324e972459";
const DATASTREAM_ENABLED_ID = "77469821-5ead-4045-97b6-acfd889ded6b";
const OTHER_SANDBOX_ID = "c1a2b3c4-0000-4000-8000-000000000001";

const sandbox = (name, title, isDefault = false) => ({
  name,
  title,
  state: "active",
  type: "production",
  region: "VA7",
  isDefault,
});

const sandboxesHandler = (...sandboxes) =>
  http.get(SANDBOXES_URL, () =>
    HttpResponse.json({
      sandboxes,
      _page: { limit: 200, count: sandboxes.length },
    }),
  );

const otherSandboxDatastreamsHandler = http.get(
  DATASTREAMS_URL,
  ({ request }) => {
    if (request.headers.get("x-sandbox-name") !== "number-two-prod") {
      return undefined;
    }
    return HttpResponse.json({
      _embedded: {
        records: [
          {
            data: { title: "second sandbox datastream", enabled: true },
            sandboxName: "number-two-prod",
            _system: { id: OTHER_SANDBOX_ID },
          },
        ],
      },
      _links: {},
    });
  },
);

let view;
let driver;
let cleanup;
let productionDatastreamField;
let stagingDatastreamField;
let developmentDatastreamField;

const expectDatastreamsLoaded = () =>
  field(
    view.getByRole("button", { name: "Refresh datastreams" }).first(),
  ).expectEnabled();

const expectAllEnvironmentFieldsVisible = async () => {
  await productionDatastreamField.expectVisible();
  await stagingDatastreamField.expectVisible();
  await developmentDatastreamField.expectVisible();
};

describe("Config datastream fields", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    productionDatastreamField = field(
      view.getByTestId("productionDatastreamField"),
    );
    stagingDatastreamField = field(view.getByTestId("stagingDatastreamField"));
    developmentDatastreamField = field(
      view.getByTestId("developmentDatastreamField"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a datastream field for every environment without input method or sandbox controls", async () => {
    await driver.init();

    await expectAllEnvironmentFieldsVisible();
    await expect
      .element(view.getByTestId("edgeConfigInputMethodSelectRadio"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("productionSandboxField"))
      .not.toBeInTheDocument();
  });

  it("shows datastream names for saved IDs and saves settings unchanged", async () => {
    const instance = {
      name: "alloy",
      edgeConfigId: ANALYTICS_ENABLED_ID,
      sandbox: "prod",
      stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
      stagingSandbox: "prod",
      developmentEdgeConfigId: DATASTREAM_ENABLED_ID,
      developmentSandbox: "prod",
    };
    await driver.init({ settings: { instances: [{ ...instance }] } });

    await productionDatastreamField.expectValue("analytics enabled");
    await stagingDatastreamField.expectValue("aep-edge-samples");
    await developmentDatastreamField.expectValue("datastream enabled");
    await driver
      .expectSettings((settings) => settings.instances[0])
      .toEqual(instance);
  });

  describe("PDCL-17391: saved sandbox names that are missing or unavailable", () => {
    beforeEach(() => {
      worker.use(sandboxesHandler(sandbox("prod", "Prod", true)));
    });

    it.each([
      ["missing", {}],
      [
        "deleted",
        {
          stagingSandbox: "deleted-staging",
          developmentSandbox: "deleted-dev",
        },
      ],
    ])(
      "shows every environment and repairs %s sandbox names from the datastream list",
      async (_, sandboxSettings) => {
        await driver.init({
          settings: {
            instances: [
              {
                name: "alloy",
                edgeConfigId: ANALYTICS_ENABLED_ID,
                sandbox: "prod",
                stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
                developmentEdgeConfigId: DATASTREAM_ENABLED_ID,
                ...sandboxSettings,
              },
            ],
          },
        });

        await productionDatastreamField.expectValue("analytics enabled");
        await stagingDatastreamField.expectValue("aep-edge-samples");
        await developmentDatastreamField.expectValue("datastream enabled");
        await driver
          .expectSettings((settings) => settings.instances[0])
          .toMatchObject({
            edgeConfigId: ANALYTICS_ENABLED_ID,
            sandbox: "prod",
            stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
            stagingSandbox: "prod",
            developmentEdgeConfigId: DATASTREAM_ENABLED_ID,
            developmentSandbox: "prod",
          });
      },
    );

    it("keeps a saved sandbox name when its datastream cannot be found", async () => {
      const instance = {
        name: "alloy",
        edgeConfigId: ANALYTICS_ENABLED_ID,
        sandbox: "prod",
        stagingEdgeConfigId: "inaccessible-datastream-id",
        stagingSandbox: "inaccessible-sandbox",
      };
      await driver.init({ settings: { instances: [{ ...instance }] } });

      await stagingDatastreamField.expectValue("inaccessible-datastream-id");
      await driver
        .expectSettings((settings) => settings.instances[0])
        .toEqual(instance);
    });
  });

  it("fills in sandbox names for legacy settings that never saved them", async () => {
    await driver.init({
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigId: ANALYTICS_ENABLED_ID,
            stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
            developmentEdgeConfigId: DATASTREAM_ENABLED_ID,
          },
        ],
      },
    });

    await productionDatastreamField.expectValue("analytics enabled");
    await driver
      .expectSettings((settings) => settings.instances[0])
      .toMatchObject({
        sandbox: "prod",
        stagingSandbox: "prod",
        developmentSandbox: "prod",
      });
  });

  it.each([
    ["data element", "%myDatastream%", undefined],
    ["legacy composite ID", `${ANALYTICS_ENABLED_ID}:dev`, "prod"],
    ["unknown ID", "unknown-datastream-id", undefined],
  ])(
    "preserves a saved %s exactly as entered",
    async (_, edgeConfigId, expectedSandbox) => {
      await driver.init({
        settings: { instances: [{ name: "alloy", edgeConfigId }] },
      });

      await expectDatastreamsLoaded();
      await productionDatastreamField.expectValue(edgeConfigId);
      await driver
        .expectSettings((settings) => settings.instances[0])
        .toEqual({
          name: "alloy",
          edgeConfigId,
          ...(expectedSandbox ? { sandbox: expectedSandbox } : {}),
        });
    },
  );

  it("shows the name of a datastream whose ID includes an environment suffix", async () => {
    worker.use(
      http.get(DATASTREAMS_URL, ({ request }) => {
        if (request.headers.get("x-sandbox-name") !== "number-two-prod") {
          return undefined;
        }
        return HttpResponse.json({
          _embedded: {
            records: [
              {
                data: { title: "suffixed environment" },
                sandboxName: "number-two-prod",
                _system: { id: `${OTHER_SANDBOX_ID}:dev` },
              },
              {
                data: { title: "base environment" },
                sandboxName: "number-two-prod",
                _system: { id: OTHER_SANDBOX_ID },
              },
            ],
          },
        });
      }),
    );
    await driver.init({
      settings: {
        instances: [{ name: "alloy", edgeConfigId: `${OTHER_SANDBOX_ID}:dev` }],
      },
    });

    await productionDatastreamField.expectValue("suffixed environment");
  });

  it("saves the ID and sandbox of a datastream chosen by name", async () => {
    await driver.init();

    await stagingDatastreamField.selectOption("datastream enabled");

    await driver
      .expectSettings((settings) => settings.instances[0])
      .toMatchObject({
        stagingEdgeConfigId: DATASTREAM_ENABLED_ID,
        stagingSandbox: "prod",
      });
  });

  it("lets each environment use a datastream from a different sandbox", async () => {
    worker.use(otherSandboxDatastreamsHandler);
    await driver.init();

    await productionDatastreamField.selectOption("analytics enabled");
    await developmentDatastreamField.selectOption("second sandbox datastream");

    await driver
      .expectSettings((settings) => settings.instances[0])
      .toMatchObject({
        edgeConfigId: ANALYTICS_ENABLED_ID,
        sandbox: "prod",
        developmentEdgeConfigId: OTHER_SANDBOX_ID,
        developmentSandbox: "number-two-prod",
      });
  });

  it("labels datastream groups with their sandbox", async () => {
    worker.use(otherSandboxDatastreamsHandler);
    await driver.init();

    await view
      .getByTestId("productionDatastreamField")
      .getByRole("button")
      .first()
      .click();

    const listbox = view.getByRole("listbox");
    await expect
      .element(
        listbox
          .getByRole("group", { name: "Prod", exact: true })
          .getByRole("option", { name: "analytics enabled" }),
      )
      .toBeVisible();
    await expect
      .element(
        listbox
          .getByRole("group", { name: "Number Two Prod" })
          .getByRole("option", { name: "second sandbox datastream" }),
      )
      .toBeVisible();
  });

  it("saves a typed value as entered, without a sandbox", async () => {
    await driver.init();

    await productionDatastreamField.fill("%prodDatastream%");
    await stagingDatastreamField.fill("typed-datastream-id");

    await driver
      .expectSettings((settings) => settings.instances[0])
      .toEqual({
        name: "alloy",
        edgeConfigId: "%prodDatastream%",
        stagingEdgeConfigId: "typed-datastream-id",
      });
  });

  it("replaces a chosen datastream with a data element from the data element selector", async () => {
    await driver.init({
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigId: ANALYTICS_ENABLED_ID,
            sandbox: "prod",
            stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
            stagingSandbox: "prod",
          },
        ],
      },
    });
    await stagingDatastreamField.expectValue("aep-edge-samples");

    await field(
      view
        .getByTestId("stagingDatastreamField")
        .locator("xpath=..")
        .getByRole("button", { name: "Select data element" }),
    ).click();

    await stagingDatastreamField.expectValue("%data element name%");
    await driver
      .expectSettings((settings) => settings.instances[0])
      .toEqual({
        name: "alloy",
        edgeConfigId: ANALYTICS_ENABLED_ID,
        sandbox: "prod",
        stagingEdgeConfigId: "%data element name%",
      });
  });

  it("saves the sandbox when a typed value is a known datastream ID", async () => {
    await driver.init();

    await stagingDatastreamField.focus();
    await userEvent.keyboard(DATASTREAM_ENABLED_ID);
    await userEvent.tab();

    await stagingDatastreamField.expectValue("datastream enabled");
    await driver
      .expectSettings((settings) => settings.instances[0])
      .toMatchObject({
        stagingEdgeConfigId: DATASTREAM_ENABLED_ID,
        stagingSandbox: "prod",
      });
  });

  it("clears the datastream and its sandbox when the field is emptied", async () => {
    await driver.init({
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigId: ANALYTICS_ENABLED_ID,
            sandbox: "prod",
            stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
            stagingSandbox: "prod",
          },
        ],
      },
    });

    await stagingDatastreamField.expectValue("aep-edge-samples");
    await stagingDatastreamField.clear();

    await driver
      .expectSettings((settings) => settings.instances[0])
      .toEqual({
        name: "alloy",
        edgeConfigId: ANALYTICS_ENABLED_ID,
        sandbox: "prod",
      });
  });

  it("does not change a value typed before the datastream list loads", async () => {
    worker.use(
      http.get(DATASTREAMS_URL, async () => {
        await delay(1000);
        return undefined;
      }),
    );
    await driver.init();

    await stagingDatastreamField.fill(DATASTREAM_ENABLED_ID);
    await stagingDatastreamField.expectValue("datastream enabled");

    await driver
      .expectSettings((settings) => settings.instances[0])
      .toMatchObject({
        stagingEdgeConfigId: DATASTREAM_ENABLED_ID,
        stagingSandbox: "prod",
      });
  });

  it("still offers datastreams from accessible sandboxes when another sandbox is forbidden", async () => {
    worker.use(
      http.get(DATASTREAMS_URL, ({ request }) => {
        if (request.headers.get("x-sandbox-name") !== "number-two-prod") {
          return undefined;
        }
        return HttpResponse.json(
          { type: "https://ns.adobe.com/aep/errors/EXEG-3050-403" },
          { status: 403 },
        );
      }),
    );
    await driver.init();

    await stagingDatastreamField.selectOption("datastream enabled");
    await driver
      .expectSettings((settings) => settings.instances[0].stagingSandbox)
      .toBe("prod");
  });

  it.each([
    ["the sandbox list", sandboxUserRegionMissingHandlers],
    ["every datastream list", datastreamsForbiddenHandlers],
  ])(
    "keeps fields editable and saved values intact when %s cannot be loaded",
    async (_, handlers) => {
      worker.use(...handlers);
      const instance = {
        name: "alloy",
        edgeConfigId: ANALYTICS_ENABLED_ID,
        sandbox: "prod",
        stagingEdgeConfigId: AEP_EDGE_SAMPLES_ID,
        stagingSandbox: "prod",
      };
      await driver.init({ settings: { instances: [{ ...instance }] } });

      await productionDatastreamField.expectValue(ANALYTICS_ENABLED_ID);
      await stagingDatastreamField.expectValue(AEP_EDGE_SAMPLES_ID);
      await field(
        view.getByText(/datastream suggestions are unavailable/i),
      ).expectVisible();
      await driver
        .expectSettings((settings) => settings.instances[0])
        .toEqual(instance);

      await developmentDatastreamField.fill("typed-dev-id");
      await driver
        .expectSettings(
          (settings) => settings.instances[0].developmentEdgeConfigId,
        )
        .toBe("typed-dev-id");
    },
  );

  describe("validation", () => {
    it("requires a production datastream", async () => {
      await driver.init({ settings: { instances: [{ name: "alloy" }] } });

      await productionDatastreamField.focus();
      await productionDatastreamField.blur();

      await productionDatastreamField.expectError(
        /please specify a datastream/i,
      );
      await driver.expectValidate().toBe(false);
    });

    it("leaves staging and development optional", async () => {
      await driver.init({
        settings: {
          instances: [{ name: "alloy", edgeConfigId: "prod-datastream-id" }],
        },
      });

      await driver.expectValidate().toBe(true);
    });
  });
});
