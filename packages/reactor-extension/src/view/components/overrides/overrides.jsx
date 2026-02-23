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
import {
  Content,
  Flex,
  Heading,
  InlineAlert,
  Item,
  TabList,
  TabPanels,
  Tabs,
  View,
} from "@adobe/react-spectrum";
import { useField } from "formik";
import PropTypes from "prop-types";
import { useRef } from "react";

import {
  DEVELOPMENT,
  ENVIRONMENTS as OVERRIDE_ENVIRONMENTS,
  PRODUCTION,
  STAGING,
} from "../../configuration/constants/environmentType";
import FormElementContainer from "../formElementContainer";
import SandboxSelector from "../sandboxSelector";
import SectionHeader from "../sectionHeader";
import DatastreamOverrideSelector from "./datastreamOverrideSelector";
import { useFetchConfig, useFormikContextWithOverrides } from "./hooks";
import OverrideInput from "./overrideInput";
import { bridge } from "./overridesBridge";
import ReportSuitesOverride from "./reportSuiteOverrides";
import SettingsCopySection from "./settingsCopySection";
import {
  ENABLED_DISABLED_MATCH_FIELD_VALUES,
  ENABLED_DISABLED_FIELD_VALUES,
  ENABLED_MATCH_FIELD_VALUES,
  FIELD_NAMES,
  capitialize,
  combineValidatorWithContainsDataElements,
  createValidateItemIsInArray,
  enabledDisabledMatchOrDataElementRegex,
  enabledDisabledOrDataElementRegex,
  enabledMatchOrDataElementRegex,
} from "./utils";

const defaults = Object.freeze(bridge.getInstanceDefaults());
const EnabledDisabledMatchOptions = Object.freeze(
  Object.entries(ENABLED_DISABLED_MATCH_FIELD_VALUES).map(([key, label]) => (
    <Item key={key}>{label}</Item>
  )),
);

const EnabledDisabledOptions = Object.freeze(
  Object.entries(ENABLED_DISABLED_FIELD_VALUES).map(([key, label]) => (
    <Item key={key}>{label}</Item>
  )),
);
const EnabledMatchOptions = Object.freeze(
  Object.entries(ENABLED_MATCH_FIELD_VALUES).map(([key, label]) => (
    <Item key={key}>{label}</Item>
  )),
);

/**
 *
 * @param {{ children: React.Element[], name: string, [k: string]: unknown }} param0
 * @returns
 */
const ProductSubsection = ({ children, name, ...otherProps }) => (
  <View {...otherProps}>
    <Heading level={3} marginBottom="size-10">
      {name}
    </Heading>
    {children}
  </View>
);
ProductSubsection.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
};

/**
 * A section of a form that allows the user to override datastream configuration
 *
 * @typedef {Object} OverridesProps
 * @property {Object} initInfo
 * @property {string?} options.instanceFieldName
 * The name of the Formik parent form. State will be stored as a nested object under the "edgeConfigOverrides" key.
 * @property {Array<"eventDatasetOverride" | "idSyncContainerOverride" | "targetPropertyTokenOverride" | "targetPropertyTokenOverride" | "reportSuitesOverride">} options.showFields
 * Which fields to show. Defaults to showing all fields
 * @property {string} options.configOrgId The org id to use for fetching datastream configurations.
 * @property {{
 *  developmentEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * },
 * stagingEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * },
 * productionEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * }}} options.edgeConfigIds The edge config ids for each environment
 * @param {OverridesProps} options
 * @returns {React.Element}
 */
const Overrides = ({
  initInfo,
  instanceFieldName,
  edgeConfigIds,
  configOrgId,
  hideFields = [],
}) => {
  const prefix = instanceFieldName
    ? `${instanceFieldName}.edgeConfigOverrides`
    : "edgeConfigOverrides";
  const visibleFields = new Set(
    Object.values(FIELD_NAMES).filter(
      (fieldName) => !hideFields.includes(fieldName),
    ),
  );

  /** @type {{value: import("./overridesBridge").EnvironmentConfigOverrideFormikState}[] } */
  const [{ value: edgeConfigOverrides }] = useField(prefix);

  const requestCache = useRef({});
  const authOrgId = initInfo.company.orgId;
  const edgeConfigs = {
    [DEVELOPMENT]: useFetchConfig({
      authOrgId,
      configOrgId,
      imsAccess: initInfo.tokens.imsAccess,
      edgeConfigId:
        edgeConfigOverrides.development?.datastreamId ||
        edgeConfigIds.developmentEnvironment.datastreamId,
      sandbox: edgeConfigOverrides.development?.datastreamId
        ? edgeConfigOverrides.development.sandbox
        : edgeConfigIds.developmentEnvironment.sandbox,
      requestCache,
    }),
    [STAGING]: useFetchConfig({
      authOrgId,
      configOrgId,
      imsAccess: initInfo.tokens.imsAccess,
      edgeConfigId:
        edgeConfigOverrides.staging?.datastreamId ||
        edgeConfigIds.stagingEnvironment?.datastreamId,
      sandbox: edgeConfigOverrides.staging?.datastreamId
        ? edgeConfigOverrides.staging?.sandbox
        : edgeConfigIds.stagingEnvironment?.sandbox,
      requestCache,
    }),
    [PRODUCTION]: useFetchConfig({
      authOrgId,
      configOrgId,
      imsAccess: initInfo.tokens.imsAccess,
      edgeConfigId:
        edgeConfigOverrides.production?.datastreamId ||
        edgeConfigIds.productionEnvironment.datastreamId,
      sandbox: edgeConfigOverrides.production?.datastreamId
        ? edgeConfigOverrides.production.sandbox
        : edgeConfigIds.productionEnvironment.sandbox,
      requestCache,
    }),
  };

  const { useServiceStatus, createIsDisabled, onCopy, onDisable } =
    useFormikContextWithOverrides({
      prefix,
      edgeConfigOverrides,
      defaults,
    });

  return (
    <>
      <SectionHeader learnMoreUrl="https://experienceleague.adobe.com/docs/experience-platform/edge/extension/web-sdk-extension-configuration.html?lang=en#datastream-configuration-overrides">
        Datastream Configuration Overrides
      </SectionHeader>
      <InlineAlert width="size-5000">
        <Heading>Server-side vs client-side</Heading>
        <Content>
          Setting any client-side datastream configuration overrides for an
          environment below will override any server-side dynamic datastream
          configurations and rules for that environment.
        </Content>
      </InlineAlert>
      <FormElementContainer>
        <Tabs aria-label="Datastream configuration overrides environments">
          <TabList>
            {OVERRIDE_ENVIRONMENTS.map((env) => (
              <Item key={env} data-test-id={`${env}OverridesTab`}>
                {capitialize(env)}
              </Item>
            ))}
          </TabList>
          <TabPanels>
            {OVERRIDE_ENVIRONMENTS.map((env) => {
              const { result, isLoading, error } = edgeConfigs[env];
              const useManualEntry = !result || Boolean(error);

              const isDisabled = createIsDisabled(`${prefix}.${env}`);

              const serviceStatus = useServiceStatus(result);

              const envEdgeConfigIds = edgeConfigIds[`${env}Environment`];

              const validateEnabledDisabledMatchOrDataElement =
                combineValidatorWithContainsDataElements(
                  createValidateItemIsInArray(
                    Object.values(ENABLED_DISABLED_MATCH_FIELD_VALUES),
                    "The value must be 'Enabled', 'Disabled', 'No override' or a single data element.",
                  ),
                  false,
                );

              const validateEnabledDisabledOrDataElement =
                combineValidatorWithContainsDataElements(
                  createValidateItemIsInArray(
                    Object.values(ENABLED_DISABLED_FIELD_VALUES),
                    "The value must be 'Enabled', 'Disabled', or a single data element.",
                  ),
                  false,
                );
              const validateEnabledMatchOrDataElement =
                combineValidatorWithContainsDataElements(
                  createValidateItemIsInArray(
                    Object.values(ENABLED_MATCH_FIELD_VALUES),
                    "The value must be 'Enabled', 'No override' or a single data element.",
                  ),
                  false,
                );

              const primaryEventDataset =
                result?.com_adobe_experience_platform?.datasets?.event?.find(
                  ({ primary }) => primary,
                )?.datasetId ?? "";
              const eventDatasetOptions =
                result?.com_adobe_experience_platform?.datasets?.event?.filter(
                  ({ primary }) => !primary,
                ) ?? [];
              let eventDatasetDescription =
                "The ID for the destination event dataset in the Adobe Experience Platform.  The value must be a preconfigured secondary dataset from your datastream configuration.";
              if (primaryEventDataset) {
                eventDatasetDescription = `Overrides the default dataset (${primaryEventDataset}). ${eventDatasetDescription}`;
              }
              const validateItemIsInDatasetsList = createValidateItemIsInArray(
                eventDatasetOptions.map(({ datasetId }) => datasetId),
                "The value must be one of the preconfigured datasets.",
              );
              const validateDatasetOption =
                combineValidatorWithContainsDataElements(
                  validateItemIsInDatasetsList,
                );

              const primaryIdSyncContainer = `${
                result?.com_adobe_identity?.idSyncContainerId ?? ""
              }`;
              const idSyncContainers =
                result?.com_adobe_identity?.idSyncContainerId__additional?.map(
                  (value) => ({ value, label: `${value}` }),
                ) ?? [];
              let idSyncContainerDescription =
                "The ID for the destination third-party ID sync container in Adobe Audience Manager. The value must be a preconfigured secondary container from your datastream configuration and overrides the primary container.";
              if (primaryIdSyncContainer) {
                idSyncContainerDescription = `Overrides the default container (${primaryIdSyncContainer}). ${idSyncContainerDescription}`;
              }
              const validateItemIsInContainersList =
                createValidateItemIsInArray(
                  idSyncContainers.map(({ label }) => label),
                  "The value must be one of the preconfigured ID sync containers.",
                );
              const validateIdSyncContainerOption = (value) => {
                if (typeof value === "string" && value?.includes("%")) {
                  // can only contain numbers and data elements
                  if (/^(\d*(%[^%\n]+%)+\d*)+$/.test(value)) {
                    return undefined;
                  }
                  return "The value must contain one or more valid data elements.";
                }
                try {
                  // forbid empty string but allow other falsey inputs
                  if (value === "" || value === undefined || value === null) {
                    return undefined;
                  }
                  const parsedValue = parseInt(value, 10);
                  if (Number.isNaN(parsedValue)) {
                    return "The value must positive, whole number.";
                  }
                  if (parsedValue < 0) {
                    return "The value must be a positive number.";
                  }
                  if (value.includes(".")) {
                    return "The value must whole number.";
                  }
                } catch {
                  return "The value must positive, whole number.";
                }
                return validateItemIsInContainersList(value);
              };

              const primaryPropertyToken =
                result?.com_adobe_target?.propertyToken ?? "";
              const propertyTokenOptions =
                result?.com_adobe_target?.propertyToken__additional?.map(
                  (value) => ({ value, label: value }),
                ) ?? [];
              let propertyTokenDescription =
                "The token for the destination property in Adobe Target. The value must be a preconfigured property override from your datastream configuration and overrides the primary property.";
              if (primaryPropertyToken) {
                propertyTokenDescription = `Overrides the default property (${primaryPropertyToken}). ${propertyTokenDescription}`;
              }
              const itemIsInPropertyTokenOptions = createValidateItemIsInArray(
                propertyTokenOptions.map(({ value }) => value),
                "The value must be one of the preconfigured property tokens.",
              );
              const validatePropertyTokenOption =
                combineValidatorWithContainsDataElements(
                  itemIsInPropertyTokenOptions,
                );

              /** @type {string[]} */
              const primaryReportSuites =
                result?.com_adobe_analytics?.reportSuites ?? [];
              const reportSuiteOptions =
                primaryReportSuites
                  .concat(result?.com_adobe_analytics?.reportSuites__additional)
                  .filter(Boolean)
                  .map((value) => ({ value, label: value })) ?? [];
              const validateItemIsInReportSuiteOptions =
                createValidateItemIsInArray(
                  reportSuiteOptions.map(({ value }) => value),
                  "The value must be one of the preconfigured report suites.",
                );
              /**
               * @param {string} value
               * @returns {string | undefined}
               */
              const validateReportSuiteOption = (value = "") =>
                value
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => Boolean(v))
                  .map(
                    combineValidatorWithContainsDataElements(
                      validateItemIsInReportSuiteOptions,
                    ),
                  )
                  .filter((v) => Boolean(v))[0];
              const sandboxFieldName = `${prefix}.${env}.${FIELD_NAMES.sandbox}`;
              const [{ value: sandbox }] = useField(sandboxFieldName);
              const dataElementDescription =
                "When providing a data element, it should resolve to true to enable the service, false to disable the service, or null to provide no overrides.";

              return (
                <Item key={env}>
                  <Flex direction="column" gap="size-100">
                    <SettingsCopySection currentEnv={env} onPress={onCopy} />
                    {visibleFields.has(FIELD_NAMES.overridesEnabled) && (
                      <OverrideInput
                        aria-label="Enable or provide no datastream configuration overrides"
                        data-test-id={FIELD_NAMES.overridesEnabled}
                        allowsCustomValue
                        validate={validateEnabledMatchOrDataElement}
                        name={`${prefix}.${env}.enabled`}
                        width="size-5000"
                        pattern={enabledMatchOrDataElementRegex}
                        description="When providing a data element, it should resolve to true to enable overrides, and false to provide no overrides."
                        onBlur={onDisable}
                      >
                        {...EnabledMatchOptions}
                      </OverrideInput>
                    )}
                    {!isDisabled("enabled", true) && (
                      <>
                        {visibleFields.has(FIELD_NAMES.datastreamId) && (
                          <>
                            <SandboxSelector
                              data-test-id={FIELD_NAMES.sandbox}
                              initInfo={initInfo}
                              label="Sandbox"
                              name={sandboxFieldName}
                              width="size-5000"
                            />
                            <DatastreamOverrideSelector
                              data-test-id={FIELD_NAMES.datastreamId}
                              label="Datastream"
                              description={`Override the configured datastream${
                                envEdgeConfigIds.datastreamId
                                  ? ` (${envEdgeConfigIds.datastreamId})`
                                  : ""
                              }.`}
                              orgId={configOrgId}
                              imsAccess={initInfo.tokens.imsAccess}
                              name={`${prefix}.${env}.datastreamId`}
                              sandbox={sandbox}
                              width="size-5000"
                            />
                          </>
                        )}
                        {(visibleFields.has(FIELD_NAMES.reportSuitesOverride) ||
                          visibleFields.has(FIELD_NAMES.analyticsEnabled)) && (
                          <ProductSubsection name="Adobe Analytics">
                            {visibleFields.has(
                              FIELD_NAMES.analyticsEnabled,
                            ) && (
                              <OverrideInput
                                aria-label="Enable, disable, or provide no overrides for Adobe Analytics"
                                data-test-id={FIELD_NAMES.analyticsEnabled}
                                allowsCustomValue
                                validate={
                                  validateEnabledDisabledMatchOrDataElement
                                }
                                name={`${prefix}.${env}.com_adobe_analytics.enabled`}
                                width="size-5000"
                                pattern={enabledDisabledMatchOrDataElementRegex}
                                isDisabled={
                                  !serviceStatus.com_adobe_analytics.value
                                }
                                disabledDisplayValue="Disabled"
                                description={dataElementDescription}
                                onBlur={onDisable}
                              >
                                {...EnabledDisabledMatchOptions}
                              </OverrideInput>
                            )}
                            {visibleFields.has(
                              FIELD_NAMES.reportSuitesOverride,
                            ) &&
                              !isDisabled(
                                "com_adobe_analytics.enabled",
                                serviceStatus.com_adobe_analytics.value,
                              ) && (
                                <ReportSuitesOverride
                                  useManualEntry={useManualEntry}
                                  validate={validateReportSuiteOption}
                                  primaryItem={primaryReportSuites}
                                  isDisabled={
                                    !serviceStatus.com_adobe_analytics.value
                                  }
                                  items={reportSuiteOptions}
                                  prefix={`${prefix}.${env}`}
                                />
                              )}
                          </ProductSubsection>
                        )}
                        {visibleFields.has(
                          FIELD_NAMES.audienceManagerEnabled,
                        ) && (
                          <ProductSubsection name="Adobe Audience Manager">
                            {visibleFields.has(
                              FIELD_NAMES.audienceManagerEnabled,
                            ) && (
                              <OverrideInput
                                aria-label="Enable, disable, or provide no overrides for Adobe Audience Manager"
                                data-test-id={
                                  FIELD_NAMES.audienceManagerEnabled
                                }
                                allowsCustomValue
                                validate={
                                  validateEnabledDisabledMatchOrDataElement
                                }
                                name={`${prefix}.${env}.com_adobe_audiencemanager.enabled`}
                                width="size-5000"
                                pattern={enabledDisabledMatchOrDataElementRegex}
                                isDisabled={
                                  !serviceStatus.com_adobe_audiencemanager.value
                                }
                                disabledDisplayValue="Disabled"
                                onBlur={onDisable}
                                description={dataElementDescription}
                              >
                                {...EnabledDisabledMatchOptions}
                              </OverrideInput>
                            )}
                          </ProductSubsection>
                        )}
                        {visibleFields.has(
                          FIELD_NAMES.idSyncContainerOverride,
                        ) && (
                          <OverrideInput
                            data-test-id={FIELD_NAMES.idSyncContainerOverride}
                            label="Third-party ID sync container"
                            useManualEntry={
                              useManualEntry || idSyncContainers.length === 0
                            }
                            allowsCustomValue
                            overrideType="third-party ID sync container"
                            primaryItem={primaryIdSyncContainer}
                            defaultItems={idSyncContainers}
                            isDisabled={!serviceStatus.com_adobe_identity.value}
                            validate={validateIdSyncContainerOption}
                            name={`${prefix}.${env}.com_adobe_identity.idSyncContainerId`}
                            inputMode="numeric"
                            width="size-5000"
                            pattern={/\d+/}
                            description={idSyncContainerDescription}
                          >
                            {({ value, label }) => (
                              <Item key={value}>{label}</Item>
                            )}
                          </OverrideInput>
                        )}
                        {[
                          FIELD_NAMES.eventDatasetOverride,
                          FIELD_NAMES.experiencePlatformEnabled,
                          FIELD_NAMES.ajoEnabled,
                          FIELD_NAMES.odeEnabled,
                          FIELD_NAMES.edgeDestinationsEnabled,
                          FIELD_NAMES.edgeSegmentationEnabled,
                        ].some((field) => visibleFields.has(field)) && (
                          <ProductSubsection name="Adobe Experience Platform">
                            {visibleFields.has(
                              FIELD_NAMES.experiencePlatformEnabled,
                            ) && (
                              <OverrideInput
                                aria-label="Enable, disable, or provide no overrides for Adobe Experience Platform"
                                data-test-id={
                                  FIELD_NAMES.experiencePlatformEnabled
                                }
                                allowsCustomValue
                                validate={
                                  validateEnabledDisabledMatchOrDataElement
                                }
                                name={`${prefix}.${env}.com_adobe_experience_platform.enabled`}
                                width="size-5000"
                                pattern={enabledDisabledMatchOrDataElementRegex}
                                isDisabled={
                                  !serviceStatus.com_adobe_experience_platform
                                    .value
                                }
                                onBlur={onDisable}
                                disabledDisplayValue="Disabled"
                                description={dataElementDescription}
                              >
                                {...EnabledDisabledMatchOptions}
                              </OverrideInput>
                            )}
                            {visibleFields.has(
                              FIELD_NAMES.eventDatasetOverride,
                            ) &&
                              !isDisabled(
                                "com_adobe_experience_platform.enabled",
                                serviceStatus.com_adobe_experience_platform
                                  .value,
                              ) && (
                                <OverrideInput
                                  useManualEntry={
                                    useManualEntry ||
                                    eventDatasetOptions.length === 0
                                  }
                                  defaultItems={eventDatasetOptions}
                                  data-test-id={
                                    FIELD_NAMES.eventDatasetOverride
                                  }
                                  label="Event dataset"
                                  description={eventDatasetDescription}
                                  width="size-5000"
                                  isDisabled={
                                    !serviceStatus.com_adobe_experience_platform
                                      .value
                                  }
                                  allowsCustomValue
                                  validate={validateDatasetOption}
                                  loadingState={isLoading}
                                  name={`${prefix}.${env}.com_adobe_experience_platform.datasets.event.datasetId`}
                                >
                                  {({ datasetId }) => (
                                    <Item key={datasetId}>{datasetId}</Item>
                                  )}
                                </OverrideInput>
                              )}
                            {visibleFields.has(FIELD_NAMES.odeEnabled) &&
                              !isDisabled(
                                "com_adobe_experience_platform.enabled",
                                serviceStatus.com_adobe_experience_platform
                                  .value,
                              ) && (
                                <OverrideInput
                                  aria-label="Enable or disable Adobe Offer Decisioning Engine"
                                  data-test-id={FIELD_NAMES.odeEnabled}
                                  allowsCustomValue
                                  label="Offer Decisioning"
                                  validate={
                                    validateEnabledDisabledOrDataElement
                                  }
                                  name={`${prefix}.${env}.com_adobe_experience_platform.com_adobe_edge_ode.enabled`}
                                  width="size-5000"
                                  pattern={enabledDisabledOrDataElementRegex}
                                  onBlur={onDisable}
                                  isDisabled={
                                    !serviceStatus
                                      .com_adobe_experience_platform_ode.value
                                  }
                                  disabledDisplayValue="Disabled"
                                >
                                  {...EnabledDisabledOptions}
                                </OverrideInput>
                              )}
                            {visibleFields.has(
                              FIELD_NAMES.edgeSegmentationEnabled,
                            ) &&
                              !isDisabled(
                                "com_adobe_experience_platform.enabled",
                                serviceStatus.com_adobe_experience_platform
                                  .value,
                              ) && (
                                <OverrideInput
                                  aria-label="Enable or disable Adobe Edge Segmentation"
                                  data-test-id={
                                    FIELD_NAMES.edgeSegmentationEnabled
                                  }
                                  allowsCustomValue
                                  label="Edge Segmentation"
                                  validate={
                                    validateEnabledDisabledOrDataElement
                                  }
                                  name={`${prefix}.${env}.com_adobe_experience_platform.com_adobe_edge_segmentation.enabled`}
                                  width="size-5000"
                                  pattern={enabledDisabledOrDataElementRegex}
                                  onBlur={onDisable}
                                  isDisabled={
                                    !serviceStatus
                                      .com_adobe_experience_platform_edge_segmentation
                                      .value
                                  }
                                  disabledDisplayValue="Disabled"
                                >
                                  {...EnabledDisabledOptions}
                                </OverrideInput>
                              )}
                            {visibleFields.has(
                              FIELD_NAMES.edgeDestinationsEnabled,
                            ) &&
                              !isDisabled(
                                "com_adobe_experience_platform.enabled",
                                serviceStatus.com_adobe_experience_platform
                                  .value,
                              ) && (
                                <OverrideInput
                                  aria-label="Enable or disable Personalization Destinations"
                                  label="Personalization Destinations"
                                  data-test-id={
                                    FIELD_NAMES.edgeDestinationsEnabled
                                  }
                                  allowsCustomValue
                                  validate={
                                    validateEnabledDisabledOrDataElement
                                  }
                                  name={`${prefix}.${env}.com_adobe_experience_platform.com_adobe_edge_destinations.enabled`}
                                  width="size-5000"
                                  pattern={enabledDisabledOrDataElementRegex}
                                  onBlur={onDisable}
                                  isDisabled={
                                    !serviceStatus
                                      .com_adobe_experience_platform_edge_destinations
                                      .value
                                  }
                                  disabledDisplayValue="Disabled"
                                >
                                  {...EnabledDisabledOptions}
                                </OverrideInput>
                              )}
                            {visibleFields.has(FIELD_NAMES.ajoEnabled) &&
                              !isDisabled(
                                "com_adobe_experience_platform.enabled",
                                serviceStatus.com_adobe_experience_platform
                                  .value,
                              ) && (
                                <OverrideInput
                                  aria-label="Enable or disable Adobe Journey Optimizer"
                                  data-test-id={FIELD_NAMES.ajoEnabled}
                                  label="Adobe Journey Optimizer"
                                  allowsCustomValue
                                  validate={
                                    validateEnabledDisabledOrDataElement
                                  }
                                  name={`${prefix}.${env}.com_adobe_experience_platform.com_adobe_edge_ajo.enabled`}
                                  width="size-5000"
                                  pattern={enabledDisabledOrDataElementRegex}
                                  onBlur={onDisable}
                                  isDisabled={
                                    !serviceStatus
                                      .com_adobe_experience_platform_ajo.value
                                  }
                                  disabledDisplayValue="Disabled"
                                >
                                  {...EnabledDisabledOptions}
                                </OverrideInput>
                              )}
                          </ProductSubsection>
                        )}
                        {visibleFields.has(FIELD_NAMES.ssefEnabled) && (
                          <ProductSubsection name="Adobe Server-Side Event Forwarding">
                            <OverrideInput
                              aria-label="Enable, disable, or provide no overrides for Adobe Server-Side Event Forwarding"
                              data-test-id={FIELD_NAMES.ssefEnabled}
                              allowsCustomValue
                              validate={
                                validateEnabledDisabledMatchOrDataElement
                              }
                              name={`${prefix}.${env}.com_adobe_launch_ssf.enabled`}
                              width="size-5000"
                              pattern={enabledDisabledMatchOrDataElementRegex}
                              onBlur={onDisable}
                              isDisabled={
                                !serviceStatus.com_adobe_launch_ssf.value
                              }
                              disabledDisplayValue="Disabled"
                              description={dataElementDescription}
                            >
                              {...EnabledDisabledMatchOptions}
                            </OverrideInput>
                          </ProductSubsection>
                        )}
                        {(visibleFields.has(FIELD_NAMES.targetEnabled) ||
                          visibleFields.has(
                            FIELD_NAMES.targetPropertyTokenOverride,
                          )) && (
                          <ProductSubsection name="Adobe Target">
                            {visibleFields.has(FIELD_NAMES.targetEnabled) && (
                              <OverrideInput
                                aria-label="Enable, disable, or provide no overrides for Adobe Target"
                                data-test-id={FIELD_NAMES.targetEnabled}
                                allowsCustomValue
                                validate={
                                  validateEnabledDisabledMatchOrDataElement
                                }
                                name={`${prefix}.${env}.com_adobe_target.enabled`}
                                width="size-5000"
                                pattern={enabledDisabledMatchOrDataElementRegex}
                                onBlur={onDisable}
                                isDisabled={
                                  !serviceStatus.com_adobe_target.value
                                }
                                disabledDisplayValue="Disabled"
                                description={dataElementDescription}
                              >
                                {...EnabledDisabledMatchOptions}
                              </OverrideInput>
                            )}
                            {visibleFields.has(
                              FIELD_NAMES.targetPropertyTokenOverride,
                            ) &&
                              !isDisabled(
                                "com_adobe_target.enabled",
                                serviceStatus.com_adobe_target.value,
                              ) && (
                                <OverrideInput
                                  data-test-id={
                                    FIELD_NAMES.targetPropertyTokenOverride
                                  }
                                  label="Target property token"
                                  allowsCustomValue
                                  overrideType="property token"
                                  primaryItem={primaryPropertyToken}
                                  isDisabled={
                                    !serviceStatus.com_adobe_target.value
                                  }
                                  validate={validatePropertyTokenOption}
                                  defaultItems={propertyTokenOptions}
                                  useManualEntry={
                                    useManualEntry ||
                                    propertyTokenOptions.length === 0
                                  }
                                  name={`${prefix}.${env}.com_adobe_target.propertyToken`}
                                  description={propertyTokenDescription}
                                  width="size-5000"
                                >
                                  {({ value, label }) => (
                                    <Item key={value}>{label}</Item>
                                  )}
                                </OverrideInput>
                              )}
                          </ProductSubsection>
                        )}
                      </>
                    )}
                  </Flex>
                </Item>
              );
            })}
          </TabPanels>
        </Tabs>
      </FormElementContainer>
    </>
  );
};

Overrides.propTypes = {
  initInfo: PropTypes.object.isRequired,
  instanceFieldName: PropTypes.string,
  edgeConfigIds: PropTypes.shape({
    developmentEnvironment: PropTypes.shape({
      datastreamId: PropTypes.string,
      sandbox: PropTypes.string,
    }),
    stagingEnvironment: PropTypes.shape({
      datastreamId: PropTypes.string,
      sandbox: PropTypes.string,
    }),
    productionEnvironment: PropTypes.shape({
      datastreamId: PropTypes.string,
      sandbox: PropTypes.string,
    }),
  }).isRequired,
  configOrgId: PropTypes.string.isRequired,
  hideFields: PropTypes.arrayOf(PropTypes.oneOf(Object.values(FIELD_NAMES))),
};

export default Overrides;
