/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useField, useFormikContext, FieldArray } from "formik";
import {
  Content,
  Flex,
  Heading,
  InlineAlert,
  View,
  Button,
  ActionButton,
  Item,
  LabeledValue,
  Text,
} from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import { object, lazy, string, array, mixed } from "yup";
import SectionHeader from "../components/sectionHeader";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikKeyedComboBox from "../components/formikReactSpectrum3/formikKeyedComboBox";
import FormikComboBox from "../components/formikReactSpectrum3/formikComboBox";
import fetchAdvertisers from "../utils/fetchAdvertisers";
import SINGLE_DATA_ELEMENT_REGEX from "../constants/singleDataElementRegex";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import BetaBadge from "../components/betaBadge";

const ENABLED = "Enabled";
const DISABLED = "Disabled";

/**
 * Returns the default settings for the advertising section
 */
const getDefaultSettings = () => ({
  dspEnabled: DISABLED,
  advertiserSettings: [
    {
      advertiserId: "",
      enabled: ENABLED,
    },
  ], // Always include one advertiser row by default for better UX
  useManualEntry: false, // Tracks if API failed (not saved to settings)
  validAdvertiserIds: [], // List of valid advertiser IDs from API (not saved to settings)
  id5PartnerId: "",
  rampIdJSPath: "",
});

/**
 * Validates that advertiser IDs are unique within the advertiser settings array.
 * Skips validation for data elements (strings containing %).
 * Only checks against previous items to avoid self-comparison.
 *
 * @param {Object} settingObject - The advertiser setting object being validated
 * @param {Object} context - Yup validation context containing parent array and path
 * @returns {boolean} - True if valid, throws error if duplicate found
 */
const validateNoDuplicateAdvertisers = (settingObject, context) => {
  const { parent } = context;

  if (
    !settingObject ||
    !settingObject.advertiserId ||
    settingObject.advertiserId.trim() === "" ||
    !Array.isArray(parent)
  ) {
    return true;
  }

  // Only validate if it's not a data element (contains %)
  if (
    typeof settingObject.advertiserId === "string" &&
    settingObject.advertiserId.includes("%")
  ) {
    return true;
  }

  // Get all advertiser settings from the parent array
  const allSettings = [...parent];
  const currentIndex = allSettings.indexOf(settingObject);
  const otherSettings = allSettings.slice(0, currentIndex);

  // Check if any previous setting has the same advertiser ID
  const hasDuplicate = otherSettings.some(
    (setting) =>
      setting.advertiserId &&
      setting.advertiserId.trim() !== "" &&
      setting.advertiserId === settingObject.advertiserId,
  );

  if (hasDuplicate) {
    throw context.createError({
      path: `${context.path}.advertiserId`,
      message: "Duplicate advertiser not allowed.",
    });
  }

  return true;
};

export const bridge = {
  /**
   * Returns the default values for a new advertising instance
   */
  getInstanceDefaults: () => ({
    advertising: getDefaultSettings(),
  }),

  /**
   * Converts stored instance settings into form values for the UI
   * Transforms boolean enabled values to "Enabled"/"Disabled" strings
   */
  getInitialInstanceValues: ({ instanceSettings }) => {
    if (!instanceSettings.advertising) {
      return bridge.getInstanceDefaults();
    }

    const advertising = {};
    copyPropertiesWithDefaultFallback({
      toObj: advertising,
      fromObj: instanceSettings.advertising || {},
      defaultsObj: getDefaultSettings(),
      keys: Object.keys(getDefaultSettings()),
    });

    // Ensure advertiserSettings is always an array with at least one row
    if (!Array.isArray(advertising.advertiserSettings)) {
      advertising.advertiserSettings = [];
    }

    // Always ensure there's at least one advertiser row for better UX
    // (Fields will be shown but validation is conditional based on DSP status)
    if (advertising.advertiserSettings.length === 0) {
      advertising.advertiserSettings = [
        {
          advertiserId: "",
          enabled: ENABLED,
        },
      ];
    }

    // Convert boolean enabled values to ENABLED/DISABLED strings for UI display
    advertising.advertiserSettings = advertising.advertiserSettings.map(
      (setting) => {
        let enabled = setting.enabled;

        if (typeof setting.enabled === "boolean") {
          enabled = setting.enabled ? ENABLED : DISABLED;
        }
        // Keep strings (including data elements) unchanged

        return {
          ...setting,
          enabled,
        };
      },
    );

    // Convert boolean dspEnabled to ENABLED/DISABLED string for UI display
    if (typeof advertising.dspEnabled === "boolean") {
      advertising.dspEnabled = advertising.dspEnabled ? ENABLED : DISABLED;
    }

    return { advertising };
  },

  /**
   * Converts form values into instance settings to be saved
   * Transforms "Enabled"/"Disabled" strings back to boolean values
   * Only includes enabled advertising component settings
   */
  getInstanceSettings: ({ instanceValues, components }) => {
    const instanceSettings = {};

    if (components.advertising) {
      const {
        advertising: {
          dspEnabled,
          advertiserSettings,
          id5PartnerId,
          rampIdJSPath,
        },
      } = instanceValues;
      const advertising = {};

      // Handle DSP enabled conversion from UI string to boolean
      if (dspEnabled !== undefined) {
        if (dspEnabled === ENABLED) {
          advertising.dspEnabled = true;
        } else if (dspEnabled === DISABLED) {
          advertising.dspEnabled = false;
        } else {
          // Keep data elements unchanged
          advertising.dspEnabled = dspEnabled;
        }
      }

      if (advertiserSettings && advertiserSettings.length > 0) {
        // Filter to only advertisers with valid IDs and convert UI strings to booleans
        const validAdvertiserSettings = advertiserSettings
          .filter(
            (setting) =>
              setting.advertiserId && setting.advertiserId.trim() !== "",
          )
          .map((setting) => {
            let enabled = setting.enabled;

            // Convert UI strings back to boolean values for storage
            if (setting.enabled === ENABLED) {
              enabled = true;
            } else if (setting.enabled === DISABLED) {
              enabled = false;
            }
            // Keep data elements unchanged

            return {
              ...setting,
              enabled,
            };
          });

        if (validAdvertiserSettings.length > 0) {
          advertising.advertiserSettings = validAdvertiserSettings;
        }
      }

      if (id5PartnerId !== "") {
        advertising.id5PartnerId = id5PartnerId;
      }
      if (rampIdJSPath !== "") {
        advertising.rampIdJSPath = rampIdJSPath;
      }

      if (Object.keys(advertising).length > 0) {
        instanceSettings.advertising = advertising;
      }
    }

    return instanceSettings;
  },

  /**
   * Yup validation schema for advertising section
   * Validates DSP enabled status and conditionally validates advertiser settings,
   * ID5 Partner ID, and RampID JS Path only when DSP is enabled or uses data elements
   */
  instanceValidationSchema: object().shape({
    advertising: object().when("$components.advertising", {
      is: true,
      then: (schema) =>
        schema.shape({
          dspEnabled: lazy((value) =>
            typeof value === "string" && value.includes("%")
              ? string()
                  .matches(SINGLE_DATA_ELEMENT_REGEX, {
                    message: "Please enter a valid data element.",
                    excludeEmptyString: true,
                  })
                  .nullable()
              : mixed()
                  .oneOf(
                    [ENABLED, DISABLED],
                    "Please choose a value or specify a data element.",
                  )
                  .required("Please choose a value or specify a data element."),
          ),
          advertiserSettings: array().when("dspEnabled", {
            is: (dspEnabled) =>
              dspEnabled === ENABLED ||
              (typeof dspEnabled === "string" && dspEnabled.includes("%")),
            then: (arraySchema) =>
              arraySchema
                .of(
                  object()
                    .shape({
                      advertiserId: string().test(
                        "advertiser-validation",
                        function testAdvertiserValidation(value) {
                          // Access advertising object from parent hierarchy
                          // this.from[0] is advertiser setting object, this.from[1] is advertising object
                          const advertisingObject = this.from?.[1]?.value;
                          const useManualEntry =
                            advertisingObject?.useManualEntry ?? false;
                          const validAdvertiserIds =
                            advertisingObject?.validAdvertiserIds ?? [];

                          // Check if value is empty
                          if (!value || value.trim() === "") {
                            return this.createError({
                              message: useManualEntry
                                ? "Please enter an advertiser ID."
                                : "Please select an advertiser.",
                            });
                          }

                          // Skip validation for data elements
                          if (value.includes("%")) {
                            return true;
                          }

                          // If API succeeded and we have valid IDs, check if value matches
                          if (
                            !useManualEntry &&
                            validAdvertiserIds.length > 0 &&
                            !validAdvertiserIds.includes(value)
                          ) {
                            return this.createError({
                              message: "Unrecognized advertiser ID.",
                            });
                          }

                          return true;
                        },
                      ),
                      enabled: lazy((value) =>
                        typeof value === "string" && value.includes("%")
                          ? string()
                              .matches(SINGLE_DATA_ELEMENT_REGEX, {
                                message: "Please enter a valid data element.",
                                excludeEmptyString: true,
                              })
                              .nullable()
                          : mixed()
                              .oneOf(
                                [ENABLED, DISABLED],
                                "Please choose a value or specify a data element.",
                              )
                              .required(
                                "Please choose a value or specify a data element.",
                              ),
                      ),
                    })
                    .test(
                      "no-duplicate-advertiser",
                      "Duplicate advertiser not allowed.",
                      validateNoDuplicateAdvertisers,
                    ),
                )
                .nullable(),
            otherwise: (arraySchema) =>
              arraySchema
                .of(
                  object().shape({
                    advertiserId: string().nullable(),
                    enabled: lazy((value) =>
                      typeof value === "string" && value.includes("%")
                        ? string()
                            .matches(SINGLE_DATA_ELEMENT_REGEX, {
                              message: "Please enter a valid data element.",
                              excludeEmptyString: true,
                            })
                            .nullable()
                        : mixed()
                            .oneOf(
                              [ENABLED, DISABLED],
                              "Please choose a value or specify a data element.",
                            )
                            .nullable(),
                    ),
                  }),
                )
                .nullable(),
          }),
          id5PartnerId: string().when("dspEnabled", {
            is: (dspEnabled) =>
              dspEnabled === ENABLED ||
              (typeof dspEnabled === "string" && dspEnabled.includes("%")),
            then: () =>
              lazy((value) =>
                typeof value === "string" && value.includes("%")
                  ? string()
                      .matches(SINGLE_DATA_ELEMENT_REGEX, {
                        message: "Please enter a valid data element.",
                        excludeEmptyString: true,
                      })
                      .nullable()
                  : string().nullable(),
              ),
            otherwise: (stringSchema) => stringSchema.nullable().notRequired(),
          }),
          rampIdJSPath: string().when("dspEnabled", {
            is: (dspEnabled) =>
              dspEnabled === ENABLED ||
              (typeof dspEnabled === "string" && dspEnabled.includes("%")),
            then: () =>
              lazy((value) =>
                typeof value === "string" && value.includes("%")
                  ? string()
                      .matches(SINGLE_DATA_ELEMENT_REGEX, {
                        message: "Please enter a valid data element.",
                        excludeEmptyString: true,
                      })
                      .nullable()
                  : string().nullable(),
              ),
            otherwise: (stringSchema) => stringSchema.nullable().notRequired(),
          }),
        }),
      otherwise: (schema) => schema.nullable().strip(),
    }),
  }),
};

const AdvertisingSection = ({ instanceFieldName, initInfo }) => {
  const { setFieldValue } = useFormikContext();
  const [{ value: advertisingComponentEnabled }] = useField(
    "components.advertising",
  );
  const [{ value: dspEnabled }] = useField(
    `${instanceFieldName}.advertising.dspEnabled`,
  );
  const [{ value: advertiserSettings }] = useField(
    `${instanceFieldName}.advertising.advertiserSettings`,
  );
  const [{ value: instances }] = useField("instances");

  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract instance index from instanceFieldName (e.g., "instances.0" -> 0)
  const instanceIndex = parseInt(instanceFieldName.split(".")[1], 10);
  const isFirstInstance = instanceIndex === 0;
  const hasMultipleInstances = instances && instances.length > 1;

  // Fetch advertisers from Adobe Advertising API when component is enabled
  useEffect(() => {
    const fetchAdvertisersData = async () => {
      if (!advertisingComponentEnabled || !initInfo) return;

      setLoading(true);
      setError(null);

      try {
        const {
          company: { orgId },
          tokens: { imsAccess },
        } = initInfo;

        const response = await fetchAdvertisers({
          orgId,
          imsAccess,
          signal: null,
        });

        const advertisersList =
          response?.items || response?.data || response || [];

        setAdvertisers(advertisersList);
        // API succeeded - use dropdown mode
        setFieldValue(`${instanceFieldName}.advertising.useManualEntry`, false);
        // Store valid advertiser IDs for validation
        setFieldValue(
          `${instanceFieldName}.advertising.validAdvertiserIds`,
          advertisersList.map((adv) => adv.advertiser_id),
        );
      } catch {
        setError(
          "Unable to retrieve advertiser data. Please contact your system administrator for assistance.",
        );
        // API failed - use manual entry mode
        setFieldValue(`${instanceFieldName}.advertising.useManualEntry`, true);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisersData();
  }, [advertisingComponentEnabled, initInfo, instanceFieldName, setFieldValue]);

  const disabledView = (
    <View width="size-6000">
      <InlineAlert variant="info">
        <Heading>Adobe Advertising component disabled</Heading>
        <Content>
          The Adobe Advertising custom build component is disabled. Enable it
          above to configure Adobe Advertising settings.
        </Content>
      </InlineAlert>
    </View>
  );

  const multiInstanceView = (
    <View width="size-6000">
      <InlineAlert variant="info">
        <Heading>Adobe Advertising available in first instance only</Heading>
        <Content>
          Adobe Advertising configuration is only available in the first
          instance. To configure Adobe Advertising settings, please use the
          first instance.
        </Content>
      </InlineAlert>
    </View>
  );

  const getAdvertisersContent = () => {
    // Show warning if API failed but still allow manual entry
    const apiWarning = error && (
      <InlineAlert variant="notice" marginBottom="size-200">
        <Heading>Unable to load advertisers</Heading>
        <Content>
          Could not retrieve advertiser data from DSP. You can manually enter
          advertiser IDs below.
        </Content>
      </InlineAlert>
    );

    // Show info if no advertisers found but still allow manual entry
    const noAdvertisersInfo = !loading &&
      !error &&
      advertisers.length === 0 && (
        <InlineAlert variant="notice" marginBottom="size-200">
          <Heading>No DSP Advertisers Found</Heading>
          <Content>
            No advertisers found for this IMS org in Adobe Advertising DSP. You
            can manually enter advertiser IDs below, or contact your DSP account
            manager to add advertisers.
          </Content>
        </InlineAlert>
      );

    return (
      <div>
        {apiWarning}
        {noAdvertisersInfo}
        <LabeledValue label="Advertisers" />
        <FieldArray
          name={`${instanceFieldName}.advertising.advertiserSettings`}
          render={(arrayHelpers) => {
            return (
              <div>
                <Flex direction="column" gap="size-100">
                  {advertiserSettings.map((setting, index) => {
                    return (
                      <Flex key={index} alignItems="start">
                        {/* Show dropdown when API succeeds, text input when API fails */}
                        {error ? (
                          <FormikTextField
                            data-test-id={`advertiser${index}Field`}
                            name={`${instanceFieldName}.advertising.advertiserSettings.${index}.advertiserId`}
                            UNSAFE_style={{ width: "224px" }}
                            aria-label={`Advertiser ${index + 1}`}
                            placeholder="Enter advertiser ID"
                            marginTop="size-0"
                            marginEnd="size-200"
                            isRequired
                          />
                        ) : (
                          <FormikKeyedComboBox
                            data-test-id={`advertiser${index}Field`}
                            name={`${instanceFieldName}.advertising.advertiserSettings.${index}.advertiserId`}
                            width="size-4000"
                            aria-label={`Advertiser ${index + 1}`}
                            marginTop="size-0"
                            marginEnd="size-200"
                            items={advertisers}
                            getKey={(advertiser) => advertiser.advertiser_id}
                            getLabel={(advertiser) =>
                              advertiser.advertiser_name
                            }
                            isDisabled={loading}
                            isRequired
                            allowsCustomValue
                          >
                            {(advertiser) => (
                              <Item
                                key={advertiser.advertiser_id}
                                data-test-id={advertiser.advertiser_id}
                              >
                                {advertiser.advertiser_name}
                              </Item>
                            )}
                          </FormikKeyedComboBox>
                        )}

                        {/* Status Dropdown - Supports Data Elements */}
                        <DataElementSelector marginEnd="size-100">
                          <FormikComboBox
                            data-test-id={`advertiserEnabled${index}Field`}
                            name={`${instanceFieldName}.advertising.advertiserSettings.${index}.enabled`}
                            width="size-2000"
                            aria-label={`Advertiser ${index + 1} status`}
                            marginTop="size-0"
                            isRequired
                            allowsCustomValue
                          >
                            <Item key={ENABLED}>{ENABLED}</Item>
                            <Item key={DISABLED}>{DISABLED}</Item>
                          </FormikComboBox>
                        </DataElementSelector>

                        {/* Delete Button - Disabled when only 1 advertiser */}
                        <ActionButton
                          data-test-id={`deleteAdvertiser${index}Button`}
                          isQuiet
                          variant="secondary"
                          isDisabled={advertiserSettings.length <= 1}
                          onPress={() => {
                            arrayHelpers.remove(index);
                          }}
                          aria-label="Remove advertiser"
                        >
                          <Delete />
                        </ActionButton>
                      </Flex>
                    );
                  })}
                </Flex>

                {/* Add Button */}
                <Button
                  variant="secondary"
                  data-test-id="addAdvertiserButton"
                  marginTop="size-100"
                  onPress={() => {
                    arrayHelpers.push({
                      advertiserId: "",
                      enabled: ENABLED,
                    });
                  }}
                >
                  Add advertiser
                </Button>
              </div>
            );
          }}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (!advertisingComponentEnabled) {
      return disabledView;
    }

    if (hasMultipleInstances && !isFirstInstance) {
      return multiInstanceView;
    }

    return (
      <FormElementContainer>
        {/* Helper text for SSC users */}
        <Text marginBottom="size-200">
          <strong>Note:</strong> No advertising configuration is necessary to
          enable click-through measurement. Search, Social, and Commerce clients
          have no further action required; however, Demand-side Platform (DSP)
          users need to configure advertisers below to measure view-through
          conversions.
        </Text>

        {/* DSP Enable/Disable Field */}
        <Flex direction="row" gap="size-250">
          <DataElementSelector>
            <FormikComboBox
              data-test-id="dspEnabledField"
              label="Adobe Advertising DSP"
              name={`${instanceFieldName}.advertising.dspEnabled`}
              description="Enable or disable DSP (Demand Side Platform) functionality."
              width="size-5000"
              isRequired
              allowsCustomValue
            >
              <Item key={ENABLED}>{ENABLED}</Item>
              <Item key={DISABLED}>{DISABLED}</Item>
            </FormikComboBox>
          </DataElementSelector>
        </Flex>

        {/* Conditional content based on DSP enabled status */}
        {(dspEnabled === ENABLED ||
          (typeof dspEnabled === "string" && dspEnabled.includes("%"))) && (
          <>
            <Flex direction="column" width="size-6000">
              {getAdvertisersContent()}
            </Flex>

            {/* ID5 and RampID fields - shown when DSP is enabled (regardless of API status) */}
            {!loading && (
              <>
                <Flex direction="row" gap="size-250">
                  <DataElementSelector>
                    <FormikTextField
                      data-test-id="id5PartnerIdField"
                      label="ID5 partner ID (optional)"
                      name={`${instanceFieldName}.advertising.id5PartnerId`}
                      description="Enter the ID5 partner ID."
                      width="size-5000"
                      allowsCustomValue
                    />
                  </DataElementSelector>
                </Flex>
                <Flex direction="row" gap="size-250">
                  <DataElementSelector>
                    <FormikTextField
                      data-test-id="rampIdJSPathField"
                      label="RampID JavaScript path (optional)"
                      name={`${instanceFieldName}.advertising.rampIdJSPath`}
                      description="Enter the RampID JavaScript (ats.js) path."
                      width="size-5000"
                      allowsCustomValue
                    />
                  </DataElementSelector>
                </Flex>
              </>
            )}
          </>
        )}
      </FormElementContainer>
    );
  };

  return (
    <>
      <SectionHeader learnMoreUrl="https://experienceleague.adobe.com/en/docs/experience-platform/tags/extensions/client/web-sdk/web-sdk-extension-configuration#general">
        Adobe Advertising <BetaBadge />
      </SectionHeader>
      {renderContent()}
    </>
  );
};

AdvertisingSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
  initInfo: PropTypes.object.isRequired,
};

export default AdvertisingSection;
