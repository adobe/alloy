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
/**
 * Create the config overrides for the given environment.
 *
 * @typedef {Object} EdgeConfigOverrides
 *
 * @param {Object} settings
 * @param { { development: EdgeConfigOverrides, staging: EdgeConfigOverrides, production: EdgeConfigOverrides }= } settings.edgeConfigOverrides
 * @param {"development" | "staging" | "production"} environmentName
 * @returns {EdgeConfigOverrides?}
 */
const createGetConfigOverrides = (environmentName) => (settings) => {
  const { edgeConfigOverrides } = settings;
  let computedConfigOverrides;
  // if there are no overrides at all, return undefined
  if (!edgeConfigOverrides) {
    return undefined;
  }
  // If there is an edgeConfigOverrides object, but no overrides for the current environment, check for
  // the old settings when there were no environment-specific overrides.
  if (!edgeConfigOverrides[environmentName]) {
    // there are no settings for this current env, but there are settings for others
    if (
      edgeConfigOverrides.development ||
      edgeConfigOverrides.staging ||
      edgeConfigOverrides.production
    ) {
      return undefined;
    }
    // there are old settings
    computedConfigOverrides = edgeConfigOverrides;
  } else {
    // there are settings for the current environment
    computedConfigOverrides = { ...edgeConfigOverrides[environmentName] };
  }

  if (
    Object.keys(computedConfigOverrides).length === 0 ||
    // explicit because `undefined` means 'enabled'
    computedConfigOverrides.enabled === false
  ) {
    return undefined;
  }
  delete computedConfigOverrides.enabled;

  // delete every child `enabled: true` key-value pair—it's the same as undefined
  // Also "no override" can be represented as undefined, "", or null from a data element.
  Object.keys(computedConfigOverrides).forEach((key) => {
    if (Object.keys(computedConfigOverrides[key]).includes("enabled")) {
      const enabled = computedConfigOverrides[key].enabled;
      if (enabled === true) {
        delete computedConfigOverrides[key].enabled;
      }
      if (enabled === "" || enabled === null || enabled === undefined) {
        delete computedConfigOverrides[key];
      }
    }
  });

  // delete every com_adobe_experience_platform.*.enabled: true key-value pair
  // its the same as undefined.
  Object.keys(
    computedConfigOverrides.com_adobe_experience_platform || {},
  ).forEach((key) => {
    if (
      computedConfigOverrides.com_adobe_experience_platform[key]?.enabled ===
      true
    ) {
      delete computedConfigOverrides.com_adobe_experience_platform[key].enabled;
    }
  });

  // handle commas in report suites, and filter out empty strings
  if (computedConfigOverrides.com_adobe_analytics?.reportSuites?.length > 0) {
    computedConfigOverrides.com_adobe_analytics.reportSuites =
      computedConfigOverrides.com_adobe_analytics.reportSuites
        .flatMap((val) => (val.includes(",") ? val.split(/,\s*/gi) : val))
        .map((rsid) => rsid.trim())
        .filter(Boolean);
  }

  // accepted input is a string that is either an integer or an empty string
  // output is either an integer or undefined
  if (
    computedConfigOverrides.com_adobe_identity?.idSyncContainerId !==
      undefined &&
    computedConfigOverrides.com_adobe_identity?.idSyncContainerId !== null &&
    typeof computedConfigOverrides.com_adobe_identity?.idSyncContainerId ===
      "string"
  ) {
    if (
      computedConfigOverrides.com_adobe_identity.idSyncContainerId.trim() === ""
    ) {
      delete computedConfigOverrides.com_adobe_identity.idSyncContainerId;
    } else {
      const parsedValue = parseInt(
        computedConfigOverrides.com_adobe_identity.idSyncContainerId.trim(),
        10,
      );
      if (Number.isNaN(parsedValue)) {
        throw new Error(
          `The ID sync container ID "${computedConfigOverrides.com_adobe_identity.idSyncContainerId}" is not a valid integer.`,
        );
      }
      computedConfigOverrides.com_adobe_identity.idSyncContainerId =
        parsedValue;
    }
  }
  // alloy handles filtering out other empty strings and empty objects
  return computedConfigOverrides;
};

module.exports = createGetConfigOverrides;
