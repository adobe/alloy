/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { TooltipTrigger, ActionButton, Tooltip } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import Delete from "@react-spectrum/s2/icons/Delete";
import PropTypes from "prop-types";

// Nudges the button down to align with a field that has a label above it.
// size-300 = 24px per the S1->S2 dimension token table.
const MARGIN_TOP_STYLES = {
  "size-300": style({ marginTop: 24 }),
  0: style({ marginTop: 0 }),
};

const ClearButton = ({ value, setValue, marginTop }) => {
  return (
    <TooltipTrigger>
      <ActionButton
        data-test-id="clearButton"
        styles={MARGIN_TOP_STYLES[marginTop]}
        isQuiet
        onPress={() => {
          setValue("");
        }}
        isDisabled={!value}
        aria-label="Clear value"
      >
        <Delete />
      </ActionButton>
      <Tooltip> Clear </Tooltip>
    </TooltipTrigger>
  );
};

ClearButton.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ClearButton;
