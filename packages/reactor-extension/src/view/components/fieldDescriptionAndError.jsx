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
import { Link, mergeStyles } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import widthStyle from "./widthStyle";

const NO_STYLE = style({});

const CONTAINER_STYLE = style({ display: "flex", flexDirection: "column" });

const MESSAGE_STYLES = {
  description: style({
    color: "gray-700",
    font: "detail-sm",
    paddingTop: 4,
    paddingBottom: 4,
  }),
  error: style({
    color: "negative",
    font: "detail-sm",
    paddingTop: 4,
    paddingBottom: 4,
  }),
};

// messagePaddingTop/messagePaddingStart nudge the description/error text to
// align under a Checkbox's label (indented past its control) instead of the
// field's own left edge. Only the tokens actually used by callers are mapped.
const MESSAGE_PADDING_TOP_STYLES = {
  "size-0": style({ paddingTop: 0 }),
};
const MESSAGE_PADDING_START_STYLES = {
  "size-300": style({ paddingStart: 24 }),
};

// This is intended as a temporary solution until descriptions and errors
// supported natively in React-Spectrum.
// https://github.com/adobe/react-spectrum/issues/1346
const FieldDescriptionAndError = ({
  children,
  description,
  error,
  width,
  messagePaddingTop,
  messagePaddingStart,
  learnMoreLink,
}) => {
  // Callers migrated to S2 pass `width` explicitly, since the field itself no
  // longer exposes a `width` string prop to introspect. Callers not yet
  // migrated still get it from the wrapped field's own `width` prop.
  const resolvedWidth = width ?? Children.only(children).props.width;

  let message;
  let messageStyleKey;
  if (error) {
    messageStyleKey = "error";
    message = error;
  } else if (description) {
    messageStyleKey = "description";
    message = description;
  }

  return (
    <div className={CONTAINER_STYLE}>
      {children}
      {message && (
        <div
          className={mergeStyles(
            MESSAGE_STYLES[messageStyleKey],
            widthStyle(resolvedWidth) ?? NO_STYLE,
            MESSAGE_PADDING_TOP_STYLES[messagePaddingTop] ?? NO_STYLE,
            MESSAGE_PADDING_START_STYLES[messagePaddingStart] ?? NO_STYLE,
          )}
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
        </div>
      )}
    </div>
  );
};

FieldDescriptionAndError.propTypes = {
  children: PropTypes.node.isRequired,
  description: PropTypes.node,
  error: PropTypes.string,
  width: PropTypes.string,
  messagePaddingTop: PropTypes.string,
  messagePaddingStart: PropTypes.string,
  learnMoreLink: PropTypes.object,
};

export default FieldDescriptionAndError;
