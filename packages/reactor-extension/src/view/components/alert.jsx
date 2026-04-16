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
import { Flex } from "@adobe/react-spectrum";
import AlertIcon from "@spectrum-icons/workflow/Alert";
import InfoIcon from "@spectrum-icons/workflow/Info";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
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

const Alert = ({
  variant = "neutral",
  title,
  children,
  className,
  ...otherProps
}) => {
  const Icon = iconByVariant[variant];
  return (
    <Flex
      direction="column"
      gap="size-100"
      UNSAFE_className={classNames("Alert", `Alert--${variant}`, className)}
      {...otherProps}
    >
      <Flex alignItems="center">
        <Heading size="XXS">{title}</Heading>
        <Icon size="S" color={variant} marginStart="auto" />
      </Flex>
      <div className="Alert-description">{children}</div>
    </Flex>
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
