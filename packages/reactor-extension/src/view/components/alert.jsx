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

import classNames from "classnames";
import {
  style,
  iconStyle,
  color,
} from "@react-spectrum/s2/style" with { type: "macro" };
import AlertIcon from "@react-spectrum/s2/icons/AlertTriangle";
import InfoIcon from "@react-spectrum/s2/icons/InfoCircle";
import CheckmarkCircle from "@react-spectrum/s2/icons/CheckmarkCircle";
import "./alert.css";
import PropTypes from "prop-types";
import Heading from "./typography/heading";

const iconByVariant = {
  neutral: () => {
    return null;
  },
  informative: InfoIcon,
  positive: CheckmarkCircle,
  notice: AlertIcon,
  negative: AlertIcon,
};

// One style per variant: the style() macro needs a literal object per call,
// so the rest of the box chrome (identical across variants) is duplicated
// here instead of composed from a runtime variant value. borderColor only
// has a named "negative" token (no informative/positive/notice), so the
// other variants resolve their border through the color() macro instead.
const CONTAINER_STYLES = {
  neutral: style({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: "sm",
    padding: 24,
    borderColor: "gray-600",
  }),
  informative: style({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: "sm",
    padding: 24,
    borderColor: `[${color("informative-900")}]`,
  }),
  positive: style({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: "sm",
    padding: 24,
    borderColor: `[${color("positive-900")}]`,
  }),
  notice: style({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: "sm",
    padding: 24,
    borderColor: `[${color("notice-900")}]`,
  }),
  negative: style({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxSizing: "border-box",
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: "sm",
    padding: 24,
    borderColor: "negative",
  }),
};

const HEADER_STYLE = style({ display: "flex", alignItems: "center" });
const DESCRIPTION_STYLE = style({ color: "gray-700" });

// One iconStyle() per variant: the macro needs a literal color per call.
const ICON_STYLES = {
  informative: iconStyle({
    size: "S",
    color: "informative",
    marginStart: "auto",
  }),
  positive: iconStyle({ size: "S", color: "positive", marginStart: "auto" }),
  notice: iconStyle({ size: "S", color: "notice", marginStart: "auto" }),
  negative: iconStyle({ size: "S", color: "negative", marginStart: "auto" }),
};

const Alert = ({
  variant = "neutral",
  title,
  children,
  className,
  ...otherProps
}) => {
  const Icon = iconByVariant[variant];
  return (
    <div
      className={classNames(CONTAINER_STYLES[variant], className)}
      {...otherProps}
    >
      <div className={HEADER_STYLE}>
        <Heading size="XXS">{title}</Heading>
        <Icon styles={ICON_STYLES[variant]} />
      </div>
      <div className={classNames("Alert-description", DESCRIPTION_STYLE)}>
        {children}
      </div>
    </div>
  );
};

Alert.propTypes = {
  variant: PropTypes.oneOf([
    "neutral",
    "informative",
    "positive",
    "notice",
    "negative",
  ]),
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  width: PropTypes.string,
  className: PropTypes.string,
};

export default Alert;
