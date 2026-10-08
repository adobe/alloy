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

import PropTypes from "prop-types";
import { mergeStyles } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

const NO_STYLE = style({});

// One font style per body size. The style() macro needs a literal object
// per call, so these can't be generated from a size -> font token map.
const FONT_STYLES = {
  XXXL: style({ font: "body-3xl" }),
  XXL: style({ font: "body-2xl" }),
  XL: style({ font: "body-xl" }),
  L: style({ font: "body-lg" }),
  M: style({ font: "body" }),
  S: style({ font: "body-sm" }),
  XS: style({ font: "body-xs" }),
  XXS: style({ font: "body-2xs" }),
};

// Only the tokens actually passed by callers are mapped; size-75 (6px in S1)
// is rounded to the nearest S2 margin step (4px). Callers may pass either the
// "size-0" token or a bare 0, so both keys are mapped to the same style.
const MARGIN_TOP_STYLES = {
  0: style({ marginTop: 0 }),
  "size-0": style({ marginTop: 0 }),
  "size-75": style({ marginTop: 4 }),
  "size-100": style({ marginTop: 8 }),
  "size-200": style({ marginTop: 16 }),
  "size-300": style({ marginTop: 24 }),
};
const MARGIN_BOTTOM_STYLES = {
  0: style({ marginBottom: 0 }),
  "size-0": style({ marginBottom: 0 }),
  "size-75": style({ marginBottom: 4 }),
  "size-100": style({ marginBottom: 8 }),
  "size-200": style({ marginBottom: 16 }),
  "size-300": style({ marginBottom: 24 }),
};

/**
 * Provides typography styling for a block of text (a paragraph). This is
 * typically unnecessary, since the S2 Provider applies default body styling
 * to all content, but this is useful when a different font size is needed.
 */
const Body = ({
  "data-test-id": dataTestId,
  children,
  size = "S",
  marginTop,
  marginBottom,
}) => {
  return (
    <p
      data-test-id={dataTestId}
      className={mergeStyles(
        FONT_STYLES[size],
        MARGIN_TOP_STYLES[marginTop] ?? NO_STYLE,
        MARGIN_BOTTOM_STYLES[marginBottom] ?? NO_STYLE,
      )}
    >
      {children}
    </p>
  );
};

export default Body;

Body.propTypes = {
  "data-test-id": PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["XXXL", "XXL", "XL", "L", "M", "S", "XS", "XXS"]),
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
