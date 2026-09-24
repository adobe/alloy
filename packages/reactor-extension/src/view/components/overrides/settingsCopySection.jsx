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
import { ActionButton } from "@react-spectrum/s2";

import { style } from "@react-spectrum/s2/style" with { type: "macro" };
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
    <div
      className={style({
        display: "flex",
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
      })}
    >
      {OVERRIDE_ENVIRONMENTS.filter((source) => source !== currentEnv).map(
        (source) => (
          <ActionButton
            data-test-id={`copyFrom${capitialize(source)}Button`}
            key={source}
            onPress={() => onPress(source, currentEnv)}
            styles={style({
              marginTop: 8,
            })}
          >
            Copy settings from {source}
          </ActionButton>
        ),
      )}
    </div>
  );
};

SettingsCopySection.propTypes = {
  currentEnv: PropTypes.oneOf(OVERRIDE_ENVIRONMENTS).isRequired,
  onPress: PropTypes.func.isRequired,
};

export default SettingsCopySection;
