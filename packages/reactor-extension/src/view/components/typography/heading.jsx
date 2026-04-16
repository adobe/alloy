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
import PropTypes from "prop-types";
import getDimensionStyle from "../../utils/getDimensionStyle";

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

/**
 * Provides typography styling for a heading. This is different than
 * React-Spectrum's Heading component, which is used for
 * a heading "slot" within components like Dialog and IllustratedMessage
 * and receives its styling from the parent component.
 * See https://opensource.adobe.com/spectrum-css/typography-body.html
 * for more info. Once React-Spectrum provides a Heading component
 * that handles typography, we can get rid of this.
 */
const Heading = ({
  "data-test-id": dataTestId,
  children,
  size = "S",
  variant,
  isSerif,
  marginTop,
  marginBottom,
}) => {
  const style = {};

  if (marginTop !== undefined) {
    style.marginTop = getDimensionStyle(marginTop);
  }

  if (marginBottom !== undefined) {
    style.marginBottom = getDimensionStyle(marginBottom);
  }

  const HeadingElement = tagBySize[size];
  return (
    <HeadingElement
      data-test-id={dataTestId}
      className={classNames(
        "spectrum-Heading",
        `spectrum-Heading--size${size}`,
        {
          "spectrum-Heading--serif": isSerif,
          "spectrum-Heading--heavy": variant === "heavy",
          "spectrum-Heading--light": variant === "light",
        },
      )}
      style={style}
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
  variant: PropTypes.oneOf(["heavy", "light"]),
  isSerif: PropTypes.bool,
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
