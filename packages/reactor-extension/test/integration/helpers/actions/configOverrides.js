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

import { http, HttpResponse } from "msw";
import { worker } from "../mocks/browser";
import field from "../field";

export const ENVIRONMENTS = ["production", "staging", "development"];

const DATASTREAMS_URL =
  "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/";

/**
 * Values typed into every environment by the TestCafe "returns full valid
 * settings" tests, and the settings they produce.
 */
export const typedOverrideValues = {
  datastreamId: "PR123",
  datasetId: "6336ff95ba16ca1c07b4c0db",
  idSyncContainerId: 23512312,
  propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
  reportSuites: ["unifiedjsqeonly2", "unifiedjsqeonly3"],
};

/**
 * Builds the saved settings of one environment.
 *
 * Pass `withEnabled: false` to build settings as older versions saved them,
 * without the top-level `enabled` key; the view infers it when loading.
 *
 * @param {object} values
 * @param {string} [values.datastreamId]
 * @param {string} [values.sandbox]
 * @param {string} values.datasetId
 * @param {number|string} values.idSyncContainerId
 * @param {string} values.propertyToken
 * @param {string[]} values.reportSuites
 * @param {{ withEnabled?: boolean }} [options]
 */
export const buildEnvironmentOverrides = (
  {
    datastreamId,
    sandbox,
    datasetId,
    idSyncContainerId,
    propertyToken,
    reportSuites,
  },
  { withEnabled = true } = {},
) => ({
  ...(withEnabled && { enabled: true }),
  ...(sandbox && { sandbox }),
  ...(datastreamId && { datastreamId }),
  com_adobe_experience_platform: { datasets: { event: { datasetId } } },
  com_adobe_analytics: { reportSuites },
  com_adobe_identity: { idSyncContainerId },
  com_adobe_target: { propertyToken },
});

export const buildEdgeConfigOverrides = (
  values,
  { environments = ENVIRONMENTS, withEnabled = true } = {},
) =>
  Object.fromEntries(
    environments.map((environment) => [
      environment,
      buildEnvironmentOverrides(values, { withEnabled }),
    ]),
  );

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const selectEnvironmentTab = async (view, environment) => {
  const tab = field(view.getByTestId(`${environment}OverridesTab`));
  await tab.click();
  await tab.expectSelected();
};

/**
 * Asserts the override fields rendered for an environment match the values
 * the environment was initialized with (every service shows "Enabled").
 *
 * @param {object} view
 * @param {string} environment
 * @param {object} values Same shape as buildEnvironmentOverrides().
 * @param {string} [datastreamLabel] Expected text of the datastream field.
 */
export const expectEnvironmentOverrides = async (
  view,
  environment,
  { datastreamId, datasetId, idSyncContainerId, propertyToken, reportSuites },
  datastreamLabel = datastreamId,
) => {
  await selectEnvironmentTab(view, environment);
  const get = (testId) => field(view.getByTestId(testId));
  await get("overridesEnabled").expectValue("Enabled");
  if (datastreamLabel) {
    await get("datastreamId").expectValue(datastreamLabel);
  }
  await get("experiencePlatformEnabled").expectValue("Enabled");
  await get("eventDatasetOverride").expectValue(datasetId);
  await get("idSyncContainerOverride").expectValue(String(idSyncContainerId));
  await get("targetEnabled").expectValue("Enabled");
  await get("targetPropertyTokenOverride").expectValue(propertyToken);
  await get("analyticsEnabled").expectValue("Enabled");
  for (const [index, reportSuite] of reportSuites.entries()) {
    // eslint-disable-next-line no-await-in-loop
    await get(`reportSuitesOverride.${index}`).expectValue(reportSuite);
  }
};

/**
 * Asserts an environment with no overrides: "No override" is chosen and none
 * of the override detail fields are rendered.
 */
export const expectNoEnvironmentOverrides = async (view, environment) => {
  await selectEnvironmentTab(view, environment);
  await field(view.getByTestId("overridesEnabled")).expectValue("No override");
  for (const testId of [
    "eventDatasetOverride",
    "idSyncContainerOverride",
    "targetPropertyTokenOverride",
    "reportSuitesOverride.0",
  ]) {
    // eslint-disable-next-line no-await-in-loop
    await field(view.getByTestId(testId)).expectHidden();
  }
};

/**
 * Types a complete set of overrides into one environment, mirroring the steps
 * of the TestCafe "returns full valid settings" tests.
 */
export const typeEnvironmentOverrides = async (
  view,
  environment,
  { datastreamId, datasetId, idSyncContainerId, propertyToken, reportSuites },
) => {
  await selectEnvironmentTab(view, environment);
  const get = (testId) => field(view.getByTestId(testId));
  await get("overridesEnabled").selectOption("Enabled");
  if (datastreamId) {
    await get("datastreamId").fill(datastreamId);
  }
  await get("experiencePlatformEnabled").selectOption("Enabled");
  await get("eventDatasetOverride").fill(datasetId);
  await get("idSyncContainerOverride").fill(String(idSyncContainerId));
  await get("targetEnabled").selectOption("Enabled");
  await get("targetPropertyTokenOverride").fill(propertyToken);
  await get("analyticsEnabled").selectOption("Enabled");
  await get("reportSuitesOverride.0").fill(reportSuites[0]);
  for (const [index, reportSuite] of reportSuites.slice(1).entries()) {
    // eslint-disable-next-line no-await-in-loop
    await get("addReportSuite").click();
    // eslint-disable-next-line no-await-in-loop
    await get(`reportSuitesOverride.${index + 1}`).fill(reportSuite);
  }
};

export const typeAllEnvironmentOverrides = async (view, values) => {
  for (const environment of ENVIRONMENTS) {
    // eslint-disable-next-line no-await-in-loop
    await typeEnvironmentOverrides(view, environment, values);
  }
};

export const expectAllEnvironmentOverrides = async (
  view,
  values,
  datastreamLabel,
) => {
  for (const environment of ENVIRONMENTS) {
    // eslint-disable-next-line no-await-in-loop
    await expectEnvironmentOverrides(
      view,
      environment,
      values,
      datastreamLabel,
    );
  }
};

export const copyEnvironmentOverrides = async (view, source, destination) => {
  await selectEnvironmentTab(view, destination);
  await field(view.getByTestId(`copyFrom${capitalize(source)}Button`)).click();
};

export const CONFIG_OVERRIDES_DATASTREAM_ID =
  "aca8c786-4940-442f-ace5-7c4aba02118e";

// Port of datastreamMocks.withConfigOverrides from the TestCafe helpers. A
// datastream whose settings offer secondary datasets, ID sync containers,
// Target property tokens and report suites for the overrides to choose from.
export const configOverridesDatastream = {
  data: {
    title: "Test Config Overrides",
    enabled: true,
    settings: {
      input: {},
      com_adobe_experience_platform: {
        enabled: true,
        datasets: {
          event: [
            {
              datasetId: "6335dd690894431c07237f2d",
              primary: true,
              xdmSchema:
                "https://ns.adobe.com/unifiedjsqeonly/schemas/c5d1823f0f13c7f52d1ae0a5e29157616835710bc7dcf68b",
              flowId: "2d981e74-0f5a-470a-a01b-3a291a4f72c7",
            },
            {
              datasetId: "6335faf30f5a161c0b4b1444",
              primary: false,
              xdmSchema:
                "https://ns.adobe.com/unifiedjsqeonly/schemas/c5d1823f0f13c7f52d1ae0a5e29157616835710bc7dcf68b",
              flowId: "cd49b412-3923-4b72-afc5-c92d585bed8e",
            },
          ],
        },
        com_adobe_edge_ode: { enabled: true },
        com_adobe_edge_segmentation: { enabled: true },
        com_adobe_edge_destinations: { enabled: true },
        com_adobe_edge_ajo: { enabled: true },
      },
      com_adobe_analytics: {
        enabled: true,
        reportSuites: [
          "unifiedjsqeonly2",
          "unifiedjsqeonlylatest",
          "unifiedjsqeonlymobileweb",
        ],
      },
      com_adobe_target: {
        enabled: true,
        propertyToken: "a15d008c-5ec0-cabd-7fc7-ab54d56f01e8",
        propertyToken__additional: [
          "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
          "65d186ff-be14-dfa0-75fa-546d93bebf91",
        ],
      },
      com_adobe_identity: {
        idSyncEnabled: true,
        idSyncContainerId: 105012,
        idSyncContainerId__additional: [107756, 107757],
      },
      com_adobe_audiencemanager: { enabled: true },
      com_adobe_launch_ssf: { enabled: true },
    },
  },
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  sandboxName: "prod",
  _system: { id: CONFIG_OVERRIDES_DATASTREAM_ID },
};

export const configOverridesInstance = {
  name: "alloy",
  edgeConfigId: CONFIG_OVERRIDES_DATASTREAM_ID,
  sandbox: "prod",
};

/**
 * Serves configOverridesDatastream for the datastream list and for fetching
 * it by ID. Any other datastream ID is not found, so instances pointing at
 * one fall back to manual entry of the override values.
 */
export const mockConfigOverridesDatastream = () => {
  worker.use(
    http.get(DATASTREAMS_URL, ({ request }) =>
      HttpResponse.json({
        _embedded: {
          records:
            request.headers.get("x-sandbox-name") === "prod"
              ? [configOverridesDatastream]
              : [],
        },
        _links: {},
      }),
    ),
    http.get(`${DATASTREAMS_URL}:id`, ({ params }) =>
      params.id === CONFIG_OVERRIDES_DATASTREAM_ID
        ? HttpResponse.json(configOverridesDatastream)
        : HttpResponse.json({}, { status: 404 }),
    ),
  );
};

/** Opens the production tab and turns its overrides on. */
export const enableProductionOverrides = async (view) => {
  await selectEnvironmentTab(view, "production");
  await field(view.getByTestId("overridesEnabled")).selectOption("Enabled");
};

/**
 * Port of the TestCafe "populates overrides dropdowns with Blackbird config
 * data" tests: the override fields offer the choices of the datastream, and
 * one choice for each field is selected. Expects the production tab to be
 * open with overrides enabled (see enableProductionOverrides) for
 * `configOverridesInstance`.
 *
 * @returns The settings expected from the selections.
 */
export const selectBlackbirdOverrides = async (view) => {
  const get = (testId) => field(view.getByTestId(testId));

  await get("experiencePlatformEnabled").selectOption("Enabled");
  await get("eventDatasetOverride").expectMenuOptionLabels([
    "6335faf30f5a161c0b4b1444",
  ]);
  await get("eventDatasetOverride").selectOption("6335faf30f5a161c0b4b1444");

  await get("idSyncContainerOverride").expectMenuOptionLabels([
    "107756",
    "107757",
  ]);
  await get("idSyncContainerOverride").selectOption("107756");

  await get("targetEnabled").selectOption("Enabled");
  await get("targetPropertyTokenOverride").expectMenuOptionLabels([
    "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
    "65d186ff-be14-dfa0-75fa-546d93bebf91",
  ]);
  await get("targetPropertyTokenOverride").selectOption(
    "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
  );

  await get("analyticsEnabled").selectOption("Enabled");
  await get("reportSuitesOverride.0").expectMenuOptionLabels([
    "unifiedjsqeonly2",
    "unifiedjsqeonlylatest",
    "unifiedjsqeonlymobileweb",
  ]);
  await get("reportSuitesOverride.0").selectOption("unifiedjsqeonlylatest");

  return {
    enabled: true,
    com_adobe_experience_platform: {
      datasets: { event: { datasetId: "6335faf30f5a161c0b4b1444" } },
    },
    com_adobe_identity: { idSyncContainerId: 107756 },
    com_adobe_target: {
      propertyToken: "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
    },
    com_adobe_analytics: { reportSuites: ["unifiedjsqeonlylatest"] },
  };
};
