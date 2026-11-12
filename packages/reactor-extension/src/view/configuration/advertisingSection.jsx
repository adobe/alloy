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
import { getBy } from "@tanstack/react-form";
import { useFormContext } from "../forms/formContext";
import { useFieldValue } from "../utils/useFieldValue";
import {
  Content,
  Heading,
  InlineAlert,
  Button,
  ActionButton,
  ComboBoxItem,
  LabeledValue,
  Text,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import Delete from "@react-spectrum/s2/icons/Delete";
import {
  all,
  isEmpty,
  matches,
  parentOf,
  rule,
  shape,
  when,
} from "../forms/validation";
import SectionHeader from "../components/sectionHeader";
import InfoMessage from "../components/infoMessage";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormTextField from "../forms/fields/TextField";
import FormKeyedComboBox from "../forms/fields/KeyedComboBox";
import FormComboBox from "../forms/fields/ComboBox";
import fetchAdvertisers from "../utils/fetchAdvertisers";
import SINGLE_DATA_ELEMENT_REGEX from "../constants/singleDataElementRegex";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";

const ENABLED = "Enabled";
const DISABLED = "Disabled";

const isDataElement = (value) =>
  typeof value === "string" && value.includes("%");

/**
 * The DSP fields (advertisers, ID5, RampID) apply when advertising is not
 * turned off and DSP is enabled or comes from a data element.
 */
const areDspFieldsActive = (enabled, dspEnabled) =>
  enabled !== DISABLED && (dspEnabled === ENABLED || isDataElement(dspEnabled));

const ENABLED_DISABLED_MESSAGE =
  "Please choose a value or specify a data element.";

const validDataElement = matches(
  SINGLE_DATA_ELEMENT_REGEX,
  "Please enter a valid data element.",
);

/**
 * Validates an Enabled/Disabled combo box that also accepts a data element.
 */
const enabledDisabledOrDataElementSchema = when(
  isDataElement,
  validDataElement,
  rule(
    (value) => [ENABLED, DISABLED].includes(value),
    ENABLED_DISABLED_MESSAGE,
  ),
);

const dspDataElementField = when((value, ctx) => {
  const { enabled, dspEnabled } = parentOf(ctx);
  return areDspFieldsActive(enabled, dspEnabled) && isDataElement(value);
}, validDataElement);

// Advertiser rules read the advertising object two levels above the setting.
const advertisingOf = (ctx) => getBy(ctx.root, ctx.path.slice(0, -3));

const advertiserIdSchema = all(
  rule(
    (value) => !isEmpty(value) && value.trim() !== "",
    (value, ctx) =>
      advertisingOf(ctx)?.useManualEntry
        ? "Please enter an advertiser ID."
        : "Please select an advertiser.",
  ),
  rule((value, ctx) => {
    const { useManualEntry = false, validAdvertiserIds = [] } =
      advertisingOf(ctx) ?? {};
    return (
      isDataElement(value) ||
      useManualEntry ||
      validAdvertiserIds.length === 0 ||
      validAdvertiserIds.includes(value)
    );
  }, "Unrecognized advertiser ID."),
  rule((value, ctx) => {
    const settings = getBy(ctx.root, ctx.path.slice(0, -2));
    return (
      isDataElement(value) ||
      !settings
        .slice(0, ctx.path.at(-2))
        .some(
          (setting) =>
            setting.advertiserId?.trim() && setting.advertiserId === value,
        )
    );
  }, "Duplicate advertiser not allowed."),
);

/**
 * Returns the default settings for the advertising section
 */
const getDefaultSettings = () => ({
  enabled: ENABLED,
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

    // Convert boolean enabled to ENABLED/DISABLED string for UI display
    if (typeof advertising.enabled === "boolean") {
      advertising.enabled = advertising.enabled ? ENABLED : DISABLED;
    }

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
          enabled,
          dspEnabled,
          advertiserSettings,
          id5PartnerId,
          rampIdJSPath,
        },
      } = instanceValues;
      const advertising = {};

      // Enabled is the Web SDK default, so it is not saved. Disabled is saved
      // as false and data elements are saved as is.
      if (enabled === DISABLED) {
        advertising.enabled = false;
      } else if (enabled !== undefined && enabled !== ENABLED) {
        advertising.enabled = enabled;
      }

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
   * Validates the advertising enabled and DSP enabled values. When advertising
   * is Disabled, the other fields are hidden and not validated. Otherwise
   * advertiser settings, ID5 Partner ID, and RampID JS Path are validated only
   * when DSP is enabled or uses data elements.
   */
  instanceValidationSchema: shape({
    advertising: when(
      (value, ctx) => ctx.root.components?.advertising === true,
      shape({
        enabled: enabledDisabledOrDataElementSchema,
        dspEnabled: when(
          (value, ctx) => parentOf(ctx).enabled !== DISABLED,
          enabledDisabledOrDataElementSchema,
        ),
        advertiserSettings: when(
          (value, ctx) => {
            const { enabled, dspEnabled } = parentOf(ctx);
            return (
              Array.isArray(value) && areDspFieldsActive(enabled, dspEnabled)
            );
          },
          shape({
            advertiserId: advertiserIdSchema,
            enabled: enabledDisabledOrDataElementSchema,
          }).array(),
          when(
            (value) => Array.isArray(value),
            shape({
              enabled: when(
                isDataElement,
                validDataElement,
                rule(
                  (value) =>
                    isEmpty(value) || [ENABLED, DISABLED].includes(value),
                  ENABLED_DISABLED_MESSAGE,
                ),
              ),
            }).array(),
          ),
        ),
        id5PartnerId: dspDataElementField,
        rampIdJSPath: dspDataElementField,
      }),
    ),
  }),
};

const AdvertisingSection = ({ instanceFieldName, initInfo }) => {
  const form = useFormContext();
  const advertisingComponentEnabled = useFieldValue("components.advertising");
  const enabled = useFieldValue(`${instanceFieldName}.advertising.enabled`);
  const dspEnabled = useFieldValue(
    `${instanceFieldName}.advertising.dspEnabled`,
  );
  const advertiserSettings = useFieldValue(
    `${instanceFieldName}.advertising.advertiserSettings`,
  );
  const instanceCount = useFieldValue("instances.length");

  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract instance index from instanceFieldName (e.g., "instances.0" -> 0)
  const instanceIndex = parseInt(instanceFieldName.split(".")[1], 10);
  const isFirstInstance = instanceIndex === 0;
  const hasMultipleInstances = instanceCount > 1;

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
        form.setFieldValue(
          `${instanceFieldName}.advertising.useManualEntry`,
          false,
        );
        // Store valid advertiser IDs for validation
        form.setFieldValue(
          `${instanceFieldName}.advertising.validAdvertiserIds`,
          advertisersList.map((adv) => adv.advertiser_id),
        );
      } catch {
        setError(
          "Unable to retrieve advertiser data. Please contact your system administrator for assistance.",
        );
        // API failed - use manual entry mode
        form.setFieldValue(
          `${instanceFieldName}.advertising.useManualEntry`,
          true,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisersData();
  }, [advertisingComponentEnabled, initInfo, instanceFieldName, form]);

  const disabledView = (
    <InfoMessage
      title="Adobe Advertising component disabled"
      styles={style({ width: 480 })}
    >
      The Adobe Advertising custom build component is disabled. Enable it above
      to configure Adobe Advertising settings.
    </InfoMessage>
  );

  const multiInstanceView = (
    <InfoMessage
      title="Adobe Advertising available in first instance only"
      styles={style({ width: 480 })}
    >
      Adobe Advertising configuration is only available in the first instance.
      To configure Adobe Advertising settings, please use the first instance.
    </InfoMessage>
  );

  const getAdvertisersContent = () => {
    // Show warning if API failed but still allow manual entry
    const apiWarning = error && (
      <InlineAlert
        variant="notice"
        styles={style({
          marginBottom: 16,
        })}
      >
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
        <InlineAlert
          variant="notice"
          styles={style({
            marginBottom: 16,
          })}
        >
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
        <div>
          <div
            className={style({
              display: "flex",
              flexDirection: "column",
              gap: 8,
            })}
          >
            {advertiserSettings.map((setting, index) => {
              return (
                <div
                  key={index}
                  className={style({
                    display: "flex",
                    alignItems: "start",
                  })}
                >
                  {/* Show dropdown when API succeeds, text input when API fails */}
                  <div className={style({ marginEnd: 16 })}>
                    {error ? (
                      <FormTextField
                        data-test-id={`advertiser${index}Field`}
                        name={`${instanceFieldName}.advertising.advertiserSettings.${index}.advertiserId`}
                        UNSAFE_style={{ width: "224px" }}
                        aria-label={`Advertiser ${index + 1}`}
                        isRequired
                      />
                    ) : (
                      <FormKeyedComboBox
                        data-test-id={`advertiser${index}Field`}
                        name={`${instanceFieldName}.advertising.advertiserSettings.${index}.advertiserId`}
                        width="size-4000"
                        aria-label={`Advertiser ${index + 1}`}
                        items={advertisers}
                        getKey={(advertiser) => advertiser.advertiser_id}
                        getLabel={(advertiser) => advertiser.advertiser_name}
                        isDisabled={loading}
                        isRequired
                        allowsCustomValue
                      >
                        {(advertiser) => (
                          <ComboBoxItem
                            key={advertiser.advertiser_id}
                            id={advertiser.advertiser_id}
                            data-test-id={advertiser.advertiser_id}
                          >
                            {advertiser.advertiser_name}
                          </ComboBoxItem>
                        )}
                      </FormKeyedComboBox>
                    )}
                  </div>

                  {/* Status Dropdown - Supports Data Elements */}
                  <div className={style({ marginEnd: 8 })}>
                    <DataElementSelector>
                      <FormComboBox
                        data-test-id={`advertiserEnabled${index}Field`}
                        name={`${instanceFieldName}.advertising.advertiserSettings.${index}.enabled`}
                        width="size-2000"
                        aria-label={`Advertiser ${index + 1} status`}
                        isRequired
                        allowsCustomValue
                      >
                        <ComboBoxItem key={ENABLED} id={ENABLED}>
                          {ENABLED}
                        </ComboBoxItem>
                        <ComboBoxItem key={DISABLED} id={DISABLED}>
                          {DISABLED}
                        </ComboBoxItem>
                      </FormComboBox>
                    </DataElementSelector>
                  </div>

                  {/* Delete Button - Disabled when only 1 advertiser */}
                  <ActionButton
                    data-test-id={`deleteAdvertiser${index}Button`}
                    isQuiet
                    variant="secondary"
                    isDisabled={advertiserSettings.length <= 1}
                    onPress={() => {
                      form.removeFieldValue(
                        `${instanceFieldName}.advertising.advertiserSettings`,
                        index,
                      );
                    }}
                    aria-label="Remove advertiser"
                  >
                    <Delete />
                  </ActionButton>
                </div>
              );
            })}
          </div>

          {/* Add Button */}
          <Button
            variant="secondary"
            data-test-id="addAdvertiserButton"
            onPress={() => {
              form.pushFieldValue(
                `${instanceFieldName}.advertising.advertiserSettings`,
                {
                  advertiserId: "",
                  enabled: ENABLED,
                },
              );
            }}
            styles={style({
              marginTop: 8,
            })}
          >
            Add advertiser
          </Button>
        </div>
      </div>
    );
  };

  const renderAdvertisingSettings = () => {
    return (
      <>
        {/* Helper text for SSC users */}
        <Text
          styles={style({
            marginBottom: 16,
          })}
        >
          <strong>Note:</strong> No advertising configuration is necessary to
          enable click-through measurement. Search, Social, and Commerce clients
          have no further action required; however, Demand-side Platform (DSP)
          users need to configure advertisers below to measure view-through
          conversions.
        </Text>

        {/* DSP Enable/Disable Field */}
        <div
          className={style({
            display: "flex",
            flexDirection: "row",
            gap: 20,
          })}
        >
          <DataElementSelector>
            <FormComboBox
              data-test-id="dspEnabledField"
              label="Adobe Advertising DSP"
              name={`${instanceFieldName}.advertising.dspEnabled`}
              description="Enable or disable DSP (Demand Side Platform) functionality."
              width="size-5000"
              isRequired
              allowsCustomValue
            >
              <ComboBoxItem key={ENABLED} id={ENABLED}>
                {ENABLED}
              </ComboBoxItem>
              <ComboBoxItem key={DISABLED} id={DISABLED}>
                {DISABLED}
              </ComboBoxItem>
            </FormComboBox>
          </DataElementSelector>
        </div>

        {/* Conditional content based on DSP enabled status */}
        {(dspEnabled === ENABLED ||
          (typeof dspEnabled === "string" && dspEnabled.includes("%"))) && (
          <>
            <div
              className={style({
                display: "flex",
                flexDirection: "column",
                width: 480,
              })}
            >
              {getAdvertisersContent()}
            </div>

            {/* ID5 and RampID fields - shown when DSP is enabled (regardless of API status) */}
            {!loading && (
              <>
                <div
                  className={style({
                    display: "flex",
                    flexDirection: "row",
                    gap: 20,
                  })}
                >
                  <DataElementSelector>
                    <FormTextField
                      data-test-id="id5PartnerIdField"
                      label="ID5 partner ID (optional)"
                      name={`${instanceFieldName}.advertising.id5PartnerId`}
                      description="Enter the ID5 partner ID."
                      width="size-5000"
                      allowsCustomValue
                    />
                  </DataElementSelector>
                </div>
                <div
                  className={style({
                    display: "flex",
                    flexDirection: "row",
                    gap: 20,
                  })}
                >
                  <DataElementSelector>
                    <FormTextField
                      data-test-id="rampIdJSPathField"
                      label="RampID JavaScript path (optional)"
                      name={`${instanceFieldName}.advertising.rampIdJSPath`}
                      description="Enter the RampID JavaScript (ats.js) path."
                      width="size-5000"
                      allowsCustomValue
                    />
                  </DataElementSelector>
                </div>
              </>
            )}
          </>
        )}
      </>
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
        {/* Advertising Enable/Disable Field */}
        <div
          className={style({
            display: "flex",
            flexDirection: "row",
            gap: 20,
          })}
        >
          <DataElementSelector>
            <FormComboBox
              data-test-id="advertisingEnabledField"
              label="Advertising"
              name={`${instanceFieldName}.advertising.enabled`}
              description="Turn advertising features on or off when Web SDK is configured. To remove the advertising code from the library, uncheck Advertising under Build options."
              width="size-5000"
              isRequired
              allowsCustomValue
            >
              <ComboBoxItem key={ENABLED} id={ENABLED}>
                {ENABLED}
              </ComboBoxItem>
              <ComboBoxItem key={DISABLED} id={DISABLED}>
                {DISABLED}
              </ComboBoxItem>
            </FormComboBox>
          </DataElementSelector>
        </div>

        {enabled !== DISABLED && renderAdvertisingSettings()}
      </FormElementContainer>
    );
  };

  return (
    <>
      <SectionHeader>Adobe Advertising</SectionHeader>
      {renderContent()}
    </>
  );
};

AdvertisingSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
  initInfo: PropTypes.object.isRequired,
};

export default AdvertisingSection;
