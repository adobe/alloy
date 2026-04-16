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

import { Flex } from "@adobe/react-spectrum";
import { object, string } from "yup";
import PropTypes from "prop-types";
import SectionHeader from "../components/sectionHeader";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import RestoreDefaultValueButton from "../components/restoreDefaultValueButton";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import FormElementContainer from "../components/formElementContainer";

export const bridge = {
  getInstanceDefaults: () => ({
    edgeBasePath: "ee",
  }),
  getInitialInstanceValues: ({ instanceSettings }) => {
    const instanceValues = {};

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: instanceSettings,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["edgeBasePath"],
    });

    return instanceValues;
  },
  getInstanceSettings: ({ instanceValues }) => {
    const instanceSettings = {};

    copyPropertiesIfValueDifferentThanDefault({
      toObj: instanceSettings,
      fromObj: instanceValues,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["edgeBasePath"],
    });

    return instanceSettings;
  },
  instanceValidationSchema: object().shape({
    edgeBasePath: string().required("Please specify an edge base path."),
  }),
};

const AdvancedSection = ({ instanceFieldName }) => {
  const instanceDefaults = bridge.getInstanceDefaults();
  return (
    <>
      <SectionHeader>Advanced Settings</SectionHeader>
      <FormElementContainer>
        <Flex>
          <DataElementSelector>
            <FormikTextField
              data-test-id="edgeBasePathField"
              label="Edge base path"
              name={`${instanceFieldName}.edgeBasePath`}
              description="Specifies the base path of the endpoint used to interact with Adobe services. This setting should only be changed if you are not intending to use the default production environment."
              width="size-5000"
              isRequired
            />
          </DataElementSelector>
          <RestoreDefaultValueButton
            data-test-id="edgeBasePathRestoreButton"
            name={`${instanceFieldName}.edgeBasePath`}
            defaultValue={instanceDefaults.edgeBasePath}
          />
        </Flex>
      </FormElementContainer>
    </>
  );
};

AdvancedSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default AdvancedSection;
