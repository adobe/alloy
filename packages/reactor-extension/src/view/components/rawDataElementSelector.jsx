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
import Data from "@react-spectrum/s2/icons/Data";
import { ActionButton } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import ClearButton from "./clearButton";

const CONTAINER_STYLE = style({ display: "flex" });

// Nudges the button down to align with a field that has a label above it.
// size-300 = 24px per the S1->S2 dimension token table.
// Keep the action target at the 32px width used before the S2 migration.
const BUTTON_MARGIN_TOP_STYLES = {
  "size-300": style({ marginTop: 24, minWidth: 32 }),
  0: style({ marginTop: 0, minWidth: 32 }),
};

const RawDataElementSelector = ({
  children,
  augmentValue,
  value,
  onChange,
  adjustForLabel,
  isDisabled,
  tokenize = true,
  clearable = false,
}) => {
  // We have to vertically nudge down the data element selector
  // button if the field has a label so the button aligns
  // with the input box.
  const marginTop = adjustForLabel ? "size-300" : 0;
  const openDataElementSelector = () => {
    window.extensionBridge
      .openDataElementSelector({ tokenize })
      .then((dataElement) => {
        // Maybe field value is an integer of 0 or something else falsy? That's
        // why we check for undefined instead of a plain falsy check.
        const previousValue = value === undefined ? "" : value;
        const newValue = augmentValue
          ? `${previousValue}${dataElement}`
          : dataElement;
        onChange(newValue);
      });
  };
  return (
    <div className={CONTAINER_STYLE}>
      {children}
      <ActionButton
        isQuiet
        isDisabled={isDisabled}
        onPress={openDataElementSelector}
        aria-label="Select data element"
        styles={BUTTON_MARGIN_TOP_STYLES[marginTop]}
      >
        <Data />
      </ActionButton>
      {clearable && (
        <ClearButton value={value} setValue={onChange} marginTop={marginTop} />
      )}
    </div>
  );
};

// You only need to specify value if augmentValue is true
RawDataElementSelector.propTypes = {
  children: PropTypes.node.isRequired,
  augmentValue: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  onChange: PropTypes.func.isRequired,
  adjustForLabel: PropTypes.bool,
  tokenize: PropTypes.bool,
  isDisabled: PropTypes.bool,
  clearable: PropTypes.bool,
};

export default RawDataElementSelector;
