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
import { ActionButton, Flex } from "@adobe/react-spectrum";
import PropTypes from "prop-types";
import { ENVIRONMENTS as OVERRIDE_ENVIRONMENTS } from "../../configuration/constants/environmentType";
import { capitialize } from "./utils";

/**
 * A section of the form that allows the user to import settings from one
 * environment into the current environment. Presents two buttons, one for each
 * non-current environment.
 *
 * @param {Object} props
 * @param {string} props.currentEnv The current environment.
 * @param {(
 *   source: "production" | "staging" | "development",
 *   destination: "production" | "staging" | "development"
 * ) => void} props.onPress The function to call when the user clicks the "Copy"
 * button.
 *
 * @returns {React.Element}
 */
const SettingsCopySection = ({ currentEnv, onPress }) => {
  return (
    <Flex direction="row" gap="size-100" wrap>
      {OVERRIDE_ENVIRONMENTS.filter((source) => source !== currentEnv).map(
        (source) => (
          <ActionButton
            data-test-id={`copyFrom${capitialize(source)}Button`}
            key={source}
            marginTop="size-100"
            onPress={() => onPress(source, currentEnv)}
          >
            Copy settings from {source}
          </ActionButton>
        ),
      )}
    </Flex>
  );
};

SettingsCopySection.propTypes = {
  currentEnv: PropTypes.oneOf(OVERRIDE_ENVIRONMENTS).isRequired,
  onPress: PropTypes.func.isRequired,
};

export default SettingsCopySection;
