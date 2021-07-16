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
import classNames from "classnames";
import PropTypes from "prop-types";
import "@spectrum-css/button";

const Text = ({ children }) => (
  <span className="spectrum-Button-label">{children}</span>
);

const Button = ({
  className,
  elementType = "a",
  variant,
  isQuiet,
  children,
  ...props
}) => {
  const Element = elementType;
  if (elementType === "a") {
    props.role = "button";
  }

  return (
    <Element
      {...props}
      className={classNames([
        className,
        "spectrum-Button",
        `spectrum-Button--${variant}`,
        "spectrum-Button--sizeM",
        { "spectrum-Button--quiet": isQuiet }
      ])}
    >
      <Text>{children}</Text>
    </Element>
  );
};

Button.propTypes = {
  elementType: PropTypes.string,
  href: PropTypes.string,
  variant: PropTypes.oneOf([
    "cta",
    "overBackground",
    "primary",
    "secondary",
    "negative"
  ]),
  isQuiet: PropTypes.bool
};

export { Button, Text };
