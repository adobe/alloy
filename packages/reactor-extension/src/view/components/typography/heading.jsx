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

const tagBySize = {
  XXXL: "h1",
  XXL: "h1",
  XL: "h1",
  L: "h2",
  M: "h3",
  S: "h4",
  XS: "h5",
  XXS: "h6",
};

// One font style per heading size. The style() macro needs a literal object
// per call, so these can't be generated from a size -> font token map.
const FONT_STYLES = {
  XXXL: style({ font: "heading-3xl" }),
  XXL: style({ font: "heading-2xl" }),
  XL: style({ font: "heading-xl" }),
  L: style({ font: "heading-lg" }),
  M: style({ font: "heading" }),
  S: style({ font: "heading-sm" }),
  XS: style({ font: "heading-xs" }),
  XXS: style({ font: "heading-2xs" }),
};

// Only the tokens actually passed by callers are mapped; size-75 (6px in S1)
// is rounded to the nearest S2 margin step (4px).
const MARGIN_TOP_STYLES = {
  "size-0": style({ marginTop: 0 }),
  "size-75": style({ marginTop: 4 }),
  "size-100": style({ marginTop: 8 }),
  "size-200": style({ marginTop: 16 }),
  "size-300": style({ marginTop: 24 }),
  "size-600": style({ marginTop: 48 }),
};
const MARGIN_BOTTOM_STYLES = {
  "size-0": style({ marginBottom: 0 }),
  "size-75": style({ marginBottom: 4 }),
  "size-100": style({ marginBottom: 8 }),
  "size-200": style({ marginBottom: 16 }),
  "size-300": style({ marginBottom: 24 }),
  "size-600": style({ marginBottom: 48 }),
};

/**
 * Provides typography styling for a heading. This is different than S2's
 * own `Heading` component, which is a slot used within components like
 * Dialog and InlineAlert and receives its styling from the parent.
 */
const Heading = ({
  "data-test-id": dataTestId,
  children,
  size = "S",
  marginTop,
  marginBottom,
}) => {
  const HeadingElement = tagBySize[size];
  return (
    <HeadingElement
      data-test-id={dataTestId}
      className={mergeStyles(
        FONT_STYLES[size],
        MARGIN_TOP_STYLES[marginTop] ?? NO_STYLE,
        MARGIN_BOTTOM_STYLES[marginBottom] ?? NO_STYLE,
      )}
    >
      {children}
    </HeadingElement>
  );
};

export default Heading;

Heading.propTypes = {
  "data-test-id": PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(Object.keys(tagBySize)),
  marginTop: PropTypes.string,
  marginBottom: PropTypes.string,
};
