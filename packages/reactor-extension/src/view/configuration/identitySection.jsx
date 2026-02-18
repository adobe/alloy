/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import PropTypes from "prop-types";
import { Flex, Item } from "@adobe/react-spectrum";
import { object, string, lazy, mixed } from "yup";
import SectionHeader from "../components/sectionHeader";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikComboBox from "../components/formikReactSpectrum3/formikComboBox";
import SINGLE_DATA_ELEMENT_REGEX from "../constants/singleDataElementRegex";

const ENABLED = "Enabled";
const DISABLED = "Disabled";

export const bridge = {
  getInstanceDefaults: () => ({
    idMigrationEnabled: true,
    thirdPartyCookiesEnabled: ENABLED,
  }),
  getInitialInstanceValues: ({
    instanceSettings: { idMigrationEnabled, thirdPartyCookiesEnabled },
  }) => {
    const instanceValues = {};

    const copyFrom = { idMigrationEnabled, thirdPartyCookiesEnabled };
    if (
      thirdPartyCookiesEnabled != null &&
      typeof thirdPartyCookiesEnabled === "boolean"
    ) {
      copyFrom.thirdPartyCookiesEnabled = thirdPartyCookiesEnabled
        ? ENABLED
        : DISABLED;
    }

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: copyFrom,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["idMigrationEnabled", "thirdPartyCookiesEnabled"],
    });
    return instanceValues;
  },
  getInstanceSettings: ({ instanceValues }) => {
    const instanceSettings = {};

    copyPropertiesIfValueDifferentThanDefault({
      toObj: instanceSettings,
      fromObj: instanceValues,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["idMigrationEnabled", "thirdPartyCookiesEnabled"],
    });

    if (instanceSettings.thirdPartyCookiesEnabled === ENABLED) {
      instanceSettings.thirdPartyCookiesEnabled = true;
    } else if (instanceSettings.thirdPartyCookiesEnabled === DISABLED) {
      instanceSettings.thirdPartyCookiesEnabled = false;
    }
    return instanceSettings;
  },
  instanceValidationSchema: object().shape({
    thirdPartyCookiesEnabled: lazy((value) =>
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
  }),
};

const IdentitySection = ({ instanceFieldName }) => {
  return (
    <>
      <SectionHeader learnMoreUrl="https://adobe.ly/39ouRzA">
        Identity
      </SectionHeader>
      <FormElementContainer>
        <FormikCheckbox
          data-test-id="idMigrationEnabledField"
          name={`${instanceFieldName}.idMigrationEnabled`}
          description="Enables the web SDK to preserve existing ECIDs by reading and writing the AMCV cookie. If your website was or is still using VisitorAPI, enable this option until users are fully migrated to the web SDK's identity cookie. This will prevent visitor cliffing."
          width="size-5000"
        >
          Migrate ECID from VisitorAPI to the web SDK
        </FormikCheckbox>
        <Flex direction="row" gap="size-250">
          <DataElementSelector>
            <FormikComboBox
              data-test-id="thirdPartyCookiesEnabledField"
              label="Use third-party cookies"
              name={`${instanceFieldName}.thirdPartyCookiesEnabled`}
              description="Enables the setting of Adobe third-party cookies. The SDK has the ability to persist the visitor ID in a third-party context to enable the same visitor ID to be used across site. This is useful if you have multiple sites or you want to share data with partners; however, sometimes this is not desired for privacy reasons. If provided as a data element, the data element should resolve to a boolean value."
              width="size-5000"
              isRequired
              allowsCustomValue
            >
              <Item key={ENABLED}>{ENABLED}</Item>
              <Item key={DISABLED}>{DISABLED}</Item>
            </FormikComboBox>
          </DataElementSelector>
        </Flex>
      </FormElementContainer>
    </>
  );
};

IdentitySection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default IdentitySection;
