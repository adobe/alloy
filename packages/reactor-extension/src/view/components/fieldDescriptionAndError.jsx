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

import { Children } from "react";
import PropTypes from "prop-types";
import "./fieldDescriptionAndError.css";
import { Flex, Link, View } from "@adobe/react-spectrum";

// This is intended as a temporary solution until descriptions and errors
// supported natively in React-Spectrum.
// https://github.com/adobe/react-spectrum/issues/1346
const FieldDescriptionAndError = ({
  children,
  description,
  error,
  messagePaddingTop,
  messagePaddingStart,
  learnMoreLink,
}) => {
  const child = Children.only(children);
  const width = child.props.width;

  let className;
  let message;

  if (error) {
    className = "FieldDescriptionAndError-error";
    message = error;
  } else if (description) {
    className = "FieldDescriptionAndError-description";
    message = description;
  }

  // By providing a width directly on the error and description
  // divs, we ensure that the text wraps at the width of the field.
  // We're using the same CSS variables here that the field itself receives.
  // There may be a way to do all of this without Spectrum's CSS variables.
  const widthStyle = width
    ? `var(--spectrum-global-dimension-${width}, var(--spectrum-alias-${width}))`
    : `var(--spectrum-field-default-width)`;

  return (
    <Flex direction="column" UNSAFE_style={{ width: widthStyle }}>
      {children}
      {message && (
        <View
          UNSAFE_className={className}
          UNSAFE_style={{ width: widthStyle }}
          paddingTop={messagePaddingTop}
          paddingStart={messagePaddingStart}
        >
          {message}
          {learnMoreLink && (
            <Link
              href={learnMoreLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          )}
        </View>
      )}
    </Flex>
  );
};

FieldDescriptionAndError.propTypes = {
  children: PropTypes.node.isRequired,
  description: PropTypes.node,
  error: PropTypes.string,
  messagePaddingTop: PropTypes.string,
  messagePaddingStart: PropTypes.string,
  learnMoreLink: PropTypes.object,
};

export default FieldDescriptionAndError;
