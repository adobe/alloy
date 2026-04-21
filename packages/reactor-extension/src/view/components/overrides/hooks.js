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
import { useFormikContext } from "formik";
import { useEffect, useState } from "react";
import fetchConfig from "../../configuration/utils/fetchConfig";
import deepGet from "../../utils/deepGet";
import {
  ENABLED_DISABLED_MATCH_FIELD_VALUES,
  FIELD_NAMES,
  overridesKeys,
} from "./utils";

/**
 * A custom React hook that calls the `fetchConfig` function to get the Blackbird
 * configuration for the specified org, sandbox, and edge config ID. Returns the
 * result as well as the loading state and any errors that arise.
 * @param {Object} options
 * @param {string} options.authOrgId The org ID tied to the authenticated user
 * @param {string} options.configOrgId The org ID tied to the datastream configuration.
 * @param {string} options.imsAccess The IMS access token.
 * @param {string} options.edgeConfigId The ID of the datastream.
 * @param {string} options.sandbox The sandbox containing the datastream.
 * @param {{ current: { [key: string]: any } }} options.requestCache
 * @returns {{ result: any, isLoading: boolean, error: any }}
 */
export const useFetchConfig = ({
  authOrgId,
  configOrgId,
  imsAccess,
  edgeConfigId,
  sandbox,
  requestCache,
}) => {
  const cacheKey = `${authOrgId}-${sandbox}-${edgeConfigId}`;
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (authOrgId !== configOrgId || !edgeConfigId || !sandbox || !imsAccess) {
      setResult(null);
      return;
    }
    setIsLoading(true);
    let request;
    if (requestCache.current[cacheKey]) {
      request = requestCache.current[cacheKey];
    } else {
      request = fetchConfig({
        orgId: authOrgId,
        imsAccess,
        edgeConfigId,
        sandbox,
        signal: null,
      });
      requestCache.current[cacheKey] = request;
    }
    request
      .then((response) => {
        const { data: { settings = {} } = {} } = response;
        setResult(settings);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authOrgId, configOrgId, imsAccess, edgeConfigId, sandbox]);
  return { result, isLoading, error };
};

/**
 * If a service is disabled in the datastream configuration, do not
 * allow the user to override the configuration. If we do not know
 * the datastream configuration, assume the service is enabled.
 * Blackbird has a more flat key-value structure than the one that
 * Konductor accepts, so we also need to map between them.
 * This object is keyed using the Blackbird key.
 * If there is not a defined API result (i.e., if we don't know the datastream ID,
 * we don't have rights to read the datastream config, etc), we assume that the
 * service is enabled.
 * @param {Record<string, any> | undefined} apiResult
 * @returns {Readonly<Record<string, Readonly<{ fieldName: string, value: boolean | undefined }>>>}
 */
const getServiceStatus = (apiResult) =>
  Object.freeze({
    com_adobe_experience_platform: {
      fieldName: "com_adobe_experience_platform.enabled",
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_experience_platform.enabled"),
    },
    com_adobe_experience_platform_ode: {
      fieldName: "com_adobe_experience_platform.com_adobe_edge_ode.enabled",
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_experience_platform_ode.enabled"),
    },
    com_adobe_experience_platform_edge_segmentation: {
      fieldName:
        "com_adobe_experience_platform.com_adobe_edge_segmentation.enabled",
      value: !apiResult
        ? true
        : deepGet(
            apiResult,
            "com_adobe_experience_platform_edge_segmentation.enabled",
          ),
    },
    // This value is not configurable via datastream config overrides.
    com_adobe_identity: {
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_identity.idSyncEnabled"),
    },
    com_adobe_experience_platform_edge_destinations: {
      fieldName:
        "com_adobe_experience_platform.com_adobe_edge_destinations.enabled",
      value: !apiResult
        ? true
        : deepGet(
            apiResult,
            "com_adobe_experience_platform_edge_destinations.enabled",
          ),
    },
    com_adobe_experience_platform_ajo: {
      fieldName: "com_adobe_experience_platform.com_adobe_edge_ajo.enabled",
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_experience_platform_ajo.enabled"),
    },
    com_adobe_analytics: {
      fieldName: "com_adobe_analytics.enabled",
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_analytics.enabled"),
    },
    com_adobe_target: {
      fieldName: "com_adobe_target.enabled",
      value: !apiResult ? true : deepGet(apiResult, "com_adobe_target.enabled"),
    },
    com_adobe_audiencemanager: {
      fieldName: "com_adobe_audiencemanager.enabled",
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_audiencemanager.enabled"),
    },
    com_adobe_launch_ssf: {
      fieldName: "com_adobe_launch_ssf.enabled",
      value: !apiResult
        ? true
        : deepGet(apiResult, "com_adobe_launch_ssf.enabled"),
    },
  });

export const useFormikContextWithOverrides = ({
  prefix,
  edgeConfigOverrides,
  defaults,
}) => {
  const { values, setFieldValue, setFieldTouched } = useFormikContext();

  const useServiceStatus = (apiResult) => {
    const serviceStatus = getServiceStatus(apiResult);
    return serviceStatus;
  };

  /**
   * @param {string} prefixWithEnv
   * @returns {(shortPropName: string, serviceIsEnabled: boolean | undefined) => boolean}
   */
  const createIsDisabled =
    (prefixWithEnv) => (shortPropName, serviceIsEnabled) => {
      const value = deepGet(values, `${prefixWithEnv}.${shortPropName}`);
      return (
        !serviceIsEnabled ||
        value === ENABLED_DISABLED_MATCH_FIELD_VALUES.disabled ||
        value === ENABLED_DISABLED_MATCH_FIELD_VALUES.match
      );
    };

  /**
   * @param {FocusEvent} e
   */
  const onDisable = (e) => {
    /** @type {HTMLInputElement} */
    const target = e.target;
    const newValue = target.value;
    if (newValue !== ENABLED_DISABLED_MATCH_FIELD_VALUES.disabled) {
      return;
    }
    const fieldName = target.getAttribute("name");
    const parentFieldName = fieldName.split(".").slice(0, -1).join(".");
    const fieldDefaults = deepGet(
      defaults,
      parentFieldName.replace(prefix, "edgeConfigOverrides"),
    );
    fieldDefaults.enabled = ENABLED_DISABLED_MATCH_FIELD_VALUES.disabled;
    setFieldValue(parentFieldName, fieldDefaults, true);
    setFieldTouched(parentFieldName, true, true);
  };

  /**
   * Import the settings from the destination to the source
   *
   * @param {"production" | "staging" | "development"} source
   * @param {"production" | "staging" | "development"} destination
   */
  const onCopy = (source, destination) => {
    [
      FIELD_NAMES.sandbox,
      FIELD_NAMES.datastreamId,
      "enabled",
      ...overridesKeys,
      "com_adobe_identity",
    ]
      .filter(
        (field) =>
          deepGet(edgeConfigOverrides[source], field) !==
          deepGet(edgeConfigOverrides[destination], field),
      )
      .forEach((field) => {
        setFieldValue(
          `${prefix}.${destination}.${field}`,
          deepGet(edgeConfigOverrides[source], field),
          true,
        );
        setFieldTouched(`${prefix}.${destination}.${field}`, true, true);
      });
  };

  return {
    values,
    useServiceStatus,
    createIsDisabled,
    onDisable,
    onCopy,
  };
};
