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

// All the places we have an enabled key
export const overridesKeys = Object.freeze([
  "com_adobe_experience_platform",
  "com_adobe_experience_platform.com_adobe_edge_ode",
  "com_adobe_experience_platform.com_adobe_edge_segmentation",
  "com_adobe_experience_platform.com_adobe_edge_destinations",
  "com_adobe_experience_platform.com_adobe_edge_ajo",
  "com_adobe_analytics",
  "com_adobe_target",
  "com_adobe_audiencemanager",
  "com_adobe_launch_ssf",
]);

/**
 * Takes a string and returns the a new string with the first letter capitalized.
 * @param {string} str
 * @returns {string}
 */
export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * The names of the different fields that can appear in the form. Used to pass
 * to the `showFields` prop of the `Overrides` component.
 */
export const FIELD_NAMES = Object.freeze({
  overridesEnabled: "overridesEnabled",
  analyticsEnabled: "analyticsEnabled",
  ajoEnabled: "ajoEnabled",
  audienceManagerEnabled: "audienceManagerEnabled",
  datastreamId: "datastreamId",
  edgeDestinationsEnabled: "edgeDestinationsEnabled",
  edgeSegmentationEnabled: "edgeSegmentationEnabled",
  eventDatasetOverride: "eventDatasetOverride",
  experiencePlatformEnabled: "experiencePlatformEnabled",
  idSyncContainerOverride: "idSyncContainerOverride",
  odeEnabled: "odeEnabled",
  reportSuitesOverride: "reportSuitesOverride",
  sandbox: "sandbox",
  ssefEnabled: "ssefEnabled",
  targetEnabled: "targetEnabled",
  targetPropertyTokenOverride: "targetPropertyTokenOverride",
});

export const ENABLED_DISABLED_MATCH_FIELD_VALUES = Object.freeze({
  enabled: "Enabled",
  disabled: "Disabled",
  match: "No override",
});

export const ENABLED_DISABLED_FIELD_VALUES = Object.freeze({
  enabled: "Enabled",
  disabled: "Disabled",
});

export const ENABLED_MATCH_FIELD_VALUES = Object.freeze({
  enabled: "Enabled",
  match: "No override",
});

/**
 * Given an instance name, returns the settings for that instance.
 * @param {Object} options
 * @param {Object} options.initInfo
 * @param {string} options.instanceName.
 * @returns {Object}
 */
export const getCurrentInstanceSettings = ({ initInfo, instanceName }) => {
  try {
    if (!instanceName) {
      instanceName = initInfo.settings.instanceName;
    }
    const instances =
      initInfo.extensionSettings?.instances ?? initInfo.settings?.instances;
    const instanceSettings = instances.find(
      (instance) => instance.name === instanceName,
    );
    return instanceSettings;
  } catch (err) {
    console.error(err);
    return {};
  }
};

/**
 * Partial function application (curried) version of Array.prototype.includes().
 * Returns a function that takes an item and returns whether the item is in the
 * array. Items must be primatives, no objects.
 * Uses a Set internally for quick lookups.
 * @template T
 * @param {Array<T>} array
 * @param {Object} options
 * @param {boolean} options.errorOnEmptyArray errorOnEmptyArray Whether or not to return false if searching
 * for an item in an empty array.
 * @param {boolean} options.errorOnEmptyItem Whether or not to return false if searching for an empty item.
 * @returns {(item: T) => boolean}
 */
export const createIsItemInArray = (
  array,
  { errorOnEmptyArray = true, errorOnEmptyItem = true } = {},
) => {
  const items = new Set(array);
  return (item) => {
    if (items.size === 0 && !errorOnEmptyArray) {
      return true;
    }
    if (!item && !errorOnEmptyItem) {
      return true;
    }
    return items.has(item);
  };
};

export const enabledDisabledMatchOrDataElementRegex =
  /^\s*(Enabled|Disabled|No override|%[^%\n]+%)\s*$/i;
export const enabledDisabledOrDataElementRegex =
  /^\s*(Enabled|Disabled|%[^%\n]+%)\s*$/i;
export const enabledMatchOrDataElementRegex =
  /^\s*(Enabled|No override|%[^%\n]+%)\s*$/i;
export const isDataElementRegex = /^\s*%[^%\n]+%\s*$/i;
export const containsDataElementsRegex = /^([^%\n]*%[^%\n]+%)+[^%\n]*$/i;

/**
 * Returns whether or not the value is a valid data element expression.
 * @param {string} value
 * @returns {boolean}
 */
export const isDataElement = (value) => isDataElementRegex.test(value);

/**
 * Returns whether or not the value contains one or more valid data element
 * expressions.
 * @param {string} value
 * @returns {boolean}
 */
export const containsDataElements = (value) =>
  containsDataElementsRegex.test(value);

/**
 * Creates a function that validates a given value. If it passes validation, it
 * returns null. Otherwise, it returns the given message.
 * @template T
 * @param {(value: T) => boolean} validator
 * @param {string} message
 * @param {boolean} appendValue If true, the value will be appended to the error message.
 * @returns {(value: T) => string | undefined}
 */
export const createValidatorWithMessage = (validator, message) => (value) =>
  validator(value) ? undefined : message.trim();

/**
 * Validate that a given item is a valid data element. If not, return an error
 * message.
 * @param {string} value
 * @returns {string | undefined}
 */
export const validateIsDataElement = createValidatorWithMessage(
  isDataElement,
  "The value must be a valid data element.",
);

/**
 * Validate that a given item contains at least one valid data element.
 * If not, return an error message.
 * @param {string} value
 * @returns {string | undefined}
 */
export const validateContainsDataElements = createValidatorWithMessage(
  containsDataElements,
  "The value must contain one or more valid data elements.",
);

/**
 * Validate that a given item is in the array. If not, return an error message.
 * @template T
 * @param {Array<T>} array
 * @param {string} message
 * @param {Object} options
 * @param {boolean} options.errorOnEmptyArray errorOnEmptyArray Whether or not to return false if searching
 * for an item in an empty array.
 * @param {boolean} options.errorOnEmptyItem Whether or not to return false if searching for an empty item.
 * @returns {(value: T) => string | undefined}
 */
export const createValidateItemIsInArray = (
  array,
  message,
  options = { errorOnEmptyArray: false, errorOnEmptyItem: false },
) => createValidatorWithMessage(createIsItemInArray(array, options), message);

/**
 *
 * @param {(value: T) => string | undefined} validator
 * @param {boolean} multiple
 * @returns
 */
export const combineValidatorWithContainsDataElements =
  (validator, multiple = true) =>
  (value) => {
    if (!value?.includes("%")) {
      return validator(value);
    }
    if (multiple) {
      return validateContainsDataElements(value);
    }
    return validateIsDataElement(value);
  };
