/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { array, lazy, mixed, number, object, string } from "yup";
import deepSet from "../../utils/deepSet";
import deepGet from "../../utils/deepGet";
import { ENVIRONMENTS as OVERRIDE_ENVIRONMENTS } from "../../configuration/constants/environmentType";
import copyPropertiesIfValueDifferentThanDefault from "../../configuration/utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "../../configuration/utils/copyPropertiesWithDefaultFallback";
import {
  overridesKeys,
  containsDataElementsRegex,
  isDataElement,
  isDataElementRegex,
  ENABLED_DISABLED_FIELD_VALUES,
  ENABLED_DISABLED_MATCH_FIELD_VALUES,
  ENABLED_MATCH_FIELD_VALUES,
} from "./utils";
import clone from "../../utils/clone";
import deepDelete from "../../utils/deepDelete";

/**
 * @typedef {Object} EnvironmentConfigOverrideFormikState
 * @property {string} [sandbox]
 * @property {string} [datastreamId]
 * @property {string} [datastreamIdInputMethod]
 * @property {Object} [com_adobe_experience_platform]
 * @property {Object} [com_adobe_experience_platform.datasets]
 * @property {Object} [com_adobe_experience_platform.datasets.event]
 * @property {string} [com_adobe_experience_platform.datasets.event.datasetId]
 * @property {Object} [com_adobe_experience_platform.datasets.profile]
 * @property {string} [com_adobe_experience_platform.datasets.profile.datasetId]
 * @property {Object} [com_adobe_analytics]
 * @property {string[]} [com_adobe_analytics.reportSuites]
 * @property {Object} [com_adobe_identity]
 * @property {string} [com_adobe_identity.idSyncContainerId]
 * @property {Object} [com_adobe_target]
 * @property {string} [com_adobe_target.propertyToken]
 *
 * @typedef {Object} ConfigOverridesFormikState
 * @property {EnvironmentConfigOverrideFormikState} [development]
 * @property {EnvironmentConfigOverrideFormikState} [staging]
 * @property {EnvironmentConfigOverrideFormikState} [production]
 *
 * @typedef {Object} EnvironmentConfigOverrideLaunchSettings
 * @property {string} [sandbox]
 * @property {string} [datastreamId]
 * @property {string} [datastreamIdInputMethod]
 * @property {Object} [com_adobe_experience_platform]
 * @property {Object} [com_adobe_experience_platform.datasets]
 * @property {Object} [com_adobe_experience_platform.datasets.event]
 * @property {string} [com_adobe_experience_platform.datasets.event.datasetId]
 * @property {Object} [com_adobe_experience_platform.datasets.profile]
 * @property {string} [com_adobe_experience_platform.datasets.profile.datasetId]
 * @property {Object} [com_adobe_analytics]
 * @property {string[]} [com_adobe_analytics.reportSuites]
 * @property {Object} [com_adobe_identity]
 * @property {number} [com_adobe_identity.idSyncContainerId]
 * @property {Object} [com_adobe_target]
 * @property {string} [com_adobe_target.propertyToken]
 *
 * @typedef {Object} ConfigOverridesLaunchSettings
 * @property {EnvironmentConfigOverrideLaunchSettings} [development]
 * @property {EnvironmentConfigOverrideLaunchSettings} [staging]
 * @property {EnvironmentConfigOverrideLaunchSettings} [production]
 */

const enabledDisabledMatchOrDataElementValidator = lazy((value) =>
  typeof value === "string" && (value.includes("%") || value === "")
    ? string()
        .matches(isDataElementRegex, {
          message: "Please enter a valid data element.",
          excludeEmptyString: true,
        })
        .nullable()
    : mixed()
        .oneOf(Object.values(ENABLED_DISABLED_MATCH_FIELD_VALUES))
        .nullable(),
);
const enabledDisabledOrDataElementValidator = lazy((value) =>
  typeof value === "string" && (value.includes("%") || value === "")
    ? string()
        .matches(isDataElementRegex, {
          message: "Please enter a valid data element.",
          excludeEmptyString: true,
        })
        .nullable()
    : mixed().oneOf(Object.values(ENABLED_DISABLED_FIELD_VALUES)).nullable(),
);
const enabledMatchOrDataElementValidator = lazy((value) =>
  typeof value === "string" && (value.includes("%") || value === "")
    ? string()
        .matches(isDataElementRegex, {
          message: "Please enter a valid data element.",
          excludeEmptyString: true,
        })
        .nullable()
    : mixed().oneOf(Object.values(ENABLED_MATCH_FIELD_VALUES)).nullable(),
);

/**
 * Convert older versions of settings to newer versions of settings.
 * @type {((instanceValues: { edgeConfigOverrides: ConfigOverridesLaunchSettings }) => { edgeConfigOverrides: ConfigOverridesLaunchSettings })[]}
 */
const migrations = [
  /**
   * Convert the environment-unaware settings into environment-aware settings.
   */
  (instanceValues) => {
    const oldOverrides = [...overridesKeys, "com_adobe_identity"]
      .filter((key) => deepGet(instanceValues, `edgeConfigOverrides.${key}`))
      .reduce((acc, key) => {
        deepSet(
          acc,
          key,
          deepGet(instanceValues, `edgeConfigOverrides.${key}`),
        );
        return acc;
      }, {});
    if (Object.keys(oldOverrides).length > 0) {
      const overrideSettings = { ...oldOverrides };
      instanceValues.edgeConfigOverrides = {};
      OVERRIDE_ENVIRONMENTS.forEach((env) => {
        instanceValues.edgeConfigOverrides[env] = clone(
          overrideSettings[env] ?? oldOverrides,
        );
      });
    }
    return instanceValues;
  },
  /**
   * Convert the com_adobe_audience_manager to com_adobe_audiencemanager.
   */
  (instanceValues) => {
    const oldProductName = "com_adobe_audience_manager";
    OVERRIDE_ENVIRONMENTS.map(
      (env) => `edgeConfigOverrides.${env}.${oldProductName}`,
    )
      .filter((key) => deepGet(instanceValues, key) !== undefined)
      .forEach((oldKey) => {
        const value = deepGet(instanceValues, oldKey);
        const newKey = oldKey.replace(
          oldProductName,
          "com_adobe_audiencemanager",
        );
        deepSet(instanceValues, newKey, value);
        deepSet(instanceValues, oldKey, undefined);
      });
    return instanceValues;
  },
  /**
   * Convert the old enabled: true into deleting the enabled key
   */
  (instanceValues) => {
    OVERRIDE_ENVIRONMENTS.flatMap((env) =>
      overridesKeys.map((key) => `edgeConfigOverrides.${env}.${key}.enabled`),
    )
      .filter((key) => deepGet(instanceValues, key) === true)
      .forEach((key) => deepDelete(instanceValues, key));
    return instanceValues;
  },
  /**
   * Add the enabled key to the top level of an environment if it has values but no enabled key
   */
  (instanceValues) => {
    OVERRIDE_ENVIRONMENTS.map((env) => `edgeConfigOverrides.${env}`)
      .filter(
        (key) => Object.keys(deepGet(instanceValues, key) || {}).length > 0,
      )
      .filter((key) => deepGet(instanceValues, `${key}.enabled`) === undefined)
      .forEach((key) => deepSet(instanceValues, `${key}.enabled`, true));
    return instanceValues;
  },
];

export const bridge = {
  /**
   * Get the default formik state for the overrides form.
   * @returns {ConfigOverridesFormikState}
   */
  getInstanceDefaults: () => ({
    edgeConfigOverrides: OVERRIDE_ENVIRONMENTS.reduce(
      (acc, env) => ({
        ...acc,
        [env]: {
          sandbox: "",
          datastreamId: "",
          datastreamIdInputMethod: "freeform",
          enabled: ENABLED_DISABLED_MATCH_FIELD_VALUES.match,
          com_adobe_experience_platform: {
            enabled: ENABLED_DISABLED_MATCH_FIELD_VALUES.match,
            datasets: {
              event: {
                datasetId: "",
              },
            },
            com_adobe_edge_ode: {
              enabled: ENABLED_DISABLED_FIELD_VALUES.enabled,
            },
            com_adobe_edge_segmentation: {
              enabled: ENABLED_DISABLED_FIELD_VALUES.enabled,
            },
            com_adobe_edge_destinations: {
              enabled: ENABLED_DISABLED_FIELD_VALUES.enabled,
            },
            com_adobe_edge_ajo: {
              enabled: ENABLED_DISABLED_FIELD_VALUES.enabled,
            },
          },
          com_adobe_analytics: {
            enabled: ENABLED_DISABLED_MATCH_FIELD_VALUES.match,
            reportSuites: [""],
          },
          com_adobe_identity: {
            idSyncContainerId: "",
          },
          com_adobe_target: {
            enabled: ENABLED_DISABLED_MATCH_FIELD_VALUES.match,
            propertyToken: "",
          },
          com_adobe_audiencemanager: {
            enabled: ENABLED_DISABLED_MATCH_FIELD_VALUES.match,
          },
          com_adobe_launch_ssf: {
            enabled: ENABLED_DISABLED_MATCH_FIELD_VALUES.match,
          },
        },
      }),
      {},
    ),
  }),
  /**
   * Converts the saved Launch instance settings to the formik state.
   * @param {{ edgeConfigOverrides: ConfigOverridesLaunchSettings }} params
   * @returns {ConfigOverridesFormikState}
   */
  getInitialInstanceValues: ({ instanceSettings }) => {
    const instanceValues = {};
    const cleanedInstanceSettings = migrations.reduce(
      (acc, migration) => migration(acc),
      clone(instanceSettings),
    );

    // convert the top level upstream settings from {enabled: false}/{}/undefined/{enabled: "%data element%"} to enabled/disabled/match
    OVERRIDE_ENVIRONMENTS.flatMap((env) =>
      overridesKeys
        .filter((key) => !key.includes("."))
        .map((key) => `edgeConfigOverrides.${env}.${key}`),
    ).forEach((key) => {
      const serviceValue = deepGet(cleanedInstanceSettings, key);
      if (serviceValue === undefined) {
        deepSet(
          cleanedInstanceSettings,
          `${key}.enabled`,
          ENABLED_MATCH_FIELD_VALUES.match,
        );
      } else if (serviceValue.enabled === false) {
        deepSet(
          cleanedInstanceSettings,
          `${key}.enabled`,
          ENABLED_DISABLED_FIELD_VALUES.disabled,
        );
      } else if (serviceValue.enabled === undefined) {
        deepSet(
          cleanedInstanceSettings,
          `${key}.enabled`,
          ENABLED_DISABLED_FIELD_VALUES.enabled,
        );
      }
    });

    // convert the com_adobe_experience_platform.* service settings from {enabled: false}/undefined to enabled/disabled
    OVERRIDE_ENVIRONMENTS.flatMap((env) =>
      overridesKeys
        .filter((key) => key.includes("."))
        .map((key) => `edgeConfigOverrides.${env}.${key}`),
    ).forEach((key) => {
      const serviceValue = deepGet(cleanedInstanceSettings, key);
      if (serviceValue === undefined) {
        deepSet(
          cleanedInstanceSettings,
          `${key}.enabled`,
          ENABLED_DISABLED_FIELD_VALUES.enabled,
        );
      } else if (serviceValue.enabled === false) {
        deepSet(
          cleanedInstanceSettings,
          `${key}.enabled`,
          ENABLED_DISABLED_FIELD_VALUES.disabled,
        );
      }
    });
    // convert the env-wide enabled/disabled from true/false to enabled/no override
    OVERRIDE_ENVIRONMENTS.map((env) => `edgeConfigOverrides.${env}.enabled`)
      .filter((key) => deepGet(cleanedInstanceSettings, key) !== undefined)
      .filter((key) => !isDataElement(deepGet(cleanedInstanceSettings, key)))
      .forEach((key) => {
        const value = deepGet(cleanedInstanceSettings, key);
        deepSet(
          cleanedInstanceSettings,
          key,
          value
            ? ENABLED_MATCH_FIELD_VALUES.enabled
            : ENABLED_MATCH_FIELD_VALUES.match,
        );
      });

    // convert the idSyncContainerId to a string
    OVERRIDE_ENVIRONMENTS.map(
      (env) =>
        `edgeConfigOverrides.${env}.com_adobe_identity.idSyncContainerId`,
    ).forEach((key) => {
      const value = deepGet(cleanedInstanceSettings, key);
      if (value !== undefined) {
        deepSet(cleanedInstanceSettings, key, `${value}`);
      }
    });

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: cleanedInstanceSettings,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["edgeConfigOverrides"],
    });

    return instanceValues;
  },
  /**
   * Converts the formik state to the Launch instance settings.
   * @param {{ instanceValues: { edgeConfigOverrides: ConfigOverridesFormikState }}} params
   * @returns {{ edgeConfigOverrides: ConfigOverridesLaunchSettings }}
   */
  getInstanceSettings: ({ instanceValues }) => {
    /** @type {{ edgeConfigOverrides?: ConfigOverridesLaunchSettings }} */
    const instanceSettings = {};
    const propertyKeysToCopy = ["edgeConfigOverrides"];

    copyPropertiesIfValueDifferentThanDefault({
      toObj: instanceSettings,
      fromObj: instanceValues,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: propertyKeysToCopy,
    });

    // Remove no override envs
    OVERRIDE_ENVIRONMENTS.map((env) => `edgeConfigOverrides.${env}`)
      // undefined means default value aka no override
      .filter(
        (key) => deepGet(instanceSettings, `${key}.enabled`) === undefined,
      )
      .forEach((key) => deepDelete(instanceSettings, key));

    // convert idSyncContainerId to a number if it is not a data element
    OVERRIDE_ENVIRONMENTS.map(
      (env) => `edgeConfigOverrides.${env}.com_adobe_identity`,
    ).forEach((key) => {
      const idSyncContainerIdKey = `${key}.idSyncContainerId`;
      const value = deepGet(instanceSettings, idSyncContainerIdKey);
      if (value !== undefined && !isDataElement(value)) {
        const parsedValue = parseInt(value, 10);
        if (!Number.isNaN(parsedValue)) {
          deepSet(instanceSettings, idSyncContainerIdKey, parsedValue);
        } else {
          deepDelete(instanceSettings, key);
        }
      }
    });

    // filter out the blank report suites
    OVERRIDE_ENVIRONMENTS.map(
      (env) => `edgeConfigOverrides.${env}.com_adobe_analytics.reportSuites`,
    ).forEach((key) => {
      const reportSuites = deepGet(instanceSettings, key);
      if (reportSuites !== undefined) {
        deepSet(
          instanceSettings,
          key,
          reportSuites.filter((rs) => rs !== ""),
        );
      }
    });

    // convert "Enabled"/"Disabled"/undefined to {...}/{enabled: false}/undefined
    OVERRIDE_ENVIRONMENTS.flatMap((env) =>
      overridesKeys.map((key) => `edgeConfigOverrides.${env}.${key}`),
    ).forEach((key) => {
      const serviceValue = deepGet(instanceSettings, key);
      if (serviceValue !== undefined) {
        if (
          serviceValue.enabled === undefined ||
          serviceValue.enabled.trim() ===
            ENABLED_DISABLED_MATCH_FIELD_VALUES.match
        ) {
          deepDelete(instanceSettings, key);
        } else if (
          serviceValue.enabled.trim() ===
          ENABLED_DISABLED_MATCH_FIELD_VALUES.enabled
        ) {
          deepDelete(instanceSettings, `${key}.enabled`);
        } else if (
          serviceValue.enabled.trim() ===
          ENABLED_DISABLED_MATCH_FIELD_VALUES.disabled
        ) {
          deepSet(instanceSettings, `${key}.enabled`, false);
        }
      }
    });

    // convert env-wide "Enabled"/"No override" to true/false
    OVERRIDE_ENVIRONMENTS.map((env) => `edgeConfigOverrides.${env}.enabled`)
      .filter((key) => deepGet(instanceSettings, key) !== undefined)
      .filter((key) => !isDataElement(deepGet(instanceSettings, key)))
      .forEach((key) => {
        const value = deepGet(instanceValues, key);
        deepSet(
          instanceSettings,
          key,
          value.trim() === ENABLED_MATCH_FIELD_VALUES.enabled,
        );
      });

    // if there are no overrides, do not include the edgeConfigOverrides object
    if (
      !instanceSettings ||
      !instanceSettings.edgeConfigOverrides ||
      Object.keys(instanceSettings.edgeConfigOverrides).length === 0
    ) {
      return {};
    }

    return instanceSettings;
  },
  formikStateValidationSchema: object({
    edgeConfigOverrides: object(
      OVERRIDE_ENVIRONMENTS.reduce(
        (acc, env) => ({
          ...acc,
          [env]: object({
            enabled: enabledMatchOrDataElementValidator,
            datastreamId: string().nullable(),
            datastreamInputMethod: mixed()
              .oneOf(["freeform", "select"])
              .nullable(),
            sandbox: string().nullable(),
            com_adobe_experience_platform: object({
              enabled: enabledDisabledMatchOrDataElementValidator,
              datasets: object({
                event: object({
                  datasetId: string().nullable(),
                }),
                profile: object({
                  datasetId: string().nullable(),
                }),
              }),
              com_adobe_edge_ode: object({
                enabled: enabledDisabledOrDataElementValidator,
              }),
              com_adobe_edge_segmentation: object({
                enabled: enabledDisabledOrDataElementValidator,
              }),
              com_adobe_edge_destinations: object({
                enabled: enabledDisabledOrDataElementValidator,
              }),
              com_adobe_edge_ajo: object({
                enabled: enabledDisabledOrDataElementValidator,
              }),
            }),
            com_adobe_analytics: object({
              enabled: enabledDisabledMatchOrDataElementValidator,
              reportSuites: array(string()).nullable(),
            }),
            com_adobe_identity: object({
              idSyncContainerId: lazy((value) =>
                typeof value === "string" &&
                (value.includes("%") || value === "")
                  ? string()
                      .matches(containsDataElementsRegex, {
                        message: "Please enter a valid data element.",
                        excludeEmptyString: true,
                      })
                      .nullable()
                  : number()
                      .typeError("Please enter a number.")
                      .positive("Please enter a positive number.")
                      .integer("Please enter a whole number.")
                      .nullable(),
              ),
            }),
            com_adobe_target: object({
              enabled: enabledDisabledMatchOrDataElementValidator,
              propertyToken: string().nullable(),
            }),
            com_adobe_audiencemanager: object({
              enabled: enabledDisabledMatchOrDataElementValidator,
            }),
            com_adobe_launch_ssf: object({
              enabled: enabledDisabledMatchOrDataElementValidator,
            }),
          }),
        }),
        {},
      ),
    ),
  }),
};
