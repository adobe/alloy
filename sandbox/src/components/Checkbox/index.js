/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from "react";
import PropTypes from "prop-types";
import "@spectrum-css/checkbox";
import { CheckMark } from "../Icons";

const Checkbox = ({ onChange, children, ...props }) => (
  <label
    {...props}
    className="spectrum-Checkbox spectrum-Checkbox--emphasized spectrum-Checkbox--sizeM"
  >
    <input
      onChange={e => {
        onChange && onChange(e.target.checked);
      }}
      type="checkbox"
      className="spectrum-Checkbox-input"
    />
    <span className="spectrum-Checkbox-box">
      <CheckMark className="spectrum-Checkbox-checkmark" />
    </span>
    <span className="spectrum-Checkbox-label">{children}</span>
  </label>
);

Checkbox.propTypes = {
  onChange: PropTypes.func
};

export { Checkbox };
