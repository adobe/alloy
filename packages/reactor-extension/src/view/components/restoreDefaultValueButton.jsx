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

import { ActionButton } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { useField } from "formik";
import PropTypes from "prop-types";

const MARGIN_TOP_STYLE = style({ marginTop: 24 });

const RestoreDefaultValueButton = ({
  "data-test-id": dataTestId,
  name,
  defaultValue,
  fieldHasLabel = true,
  ...otherProps
}) => {
  const [, , { setValue }] = useField(name);
  return (
    <ActionButton
      {...otherProps}
      data-test-id={dataTestId}
      onPress={() => {
        setValue(defaultValue, true);
      }}
      styles={fieldHasLabel ? MARGIN_TOP_STYLE : undefined}
    >
      Restore default
    </ActionButton>
  );
};

RestoreDefaultValueButton.propTypes = {
  "data-test-id": PropTypes.string,
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.string.isRequired,
  fieldHasLabel: PropTypes.bool,
};

export default RestoreDefaultValueButton;
