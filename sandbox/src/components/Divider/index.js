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
import "@spectrum-css/divider";
import classNames from "classnames";
import PropTypes from "prop-types";

const Divider = ({ className, size, orientation = "horizontal", ...props }) => (
  <hr
    role="separator"
    aria-orientation={orientation}
    className={classNames([
      "spectrum-Divider",
      `spectrum-Divider--size${size}`,
      { "spectrum-Divider--vertical": orientation === "vertical" },
      className
    ])}
    {...props}
  />
);

Divider.propTypes = {
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  size: PropTypes.oneOf(["S", "M", "L"])
};

export { Divider };
