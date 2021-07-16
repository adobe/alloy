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

import React, { cloneElement } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import "@spectrum-css/link";

const Link = ({ variant = "primary", children }) =>
  cloneElement(children, {
    className: classNames([
      "spectrum-Link",
      "spectrum-Link--quiet",
      { "spectrum-Link--secondary": variant === "secondary" }
    ])
  });

Link.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary"])
};

export { Link };
