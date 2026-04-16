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

/**
 * Provides typography styling for a block of text (a paragraph).
 * This is typically unnecessary, since the React-Spectrum Provider
 * component provides basic default body styling for all content,
 * but this can be useful in scenarios where a different font size
 * is needed.
 * See https://opensource.adobe.com/spectrum-css/typography-body.html
 * for more info. Once React-Spectrum provides a Body component
 * that handles typography, we can get rid of this.
 */
const Body = ({
  "data-test-id": dataTestId,
  children,
  size = "S",
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

  return (
    <p
      data-test-id={dataTestId}
      className={classNames("spectrum-Body", `spectrum-Body--size${size}`, {
        "spectrum-Body--serif": isSerif,
      })}
      style={style}
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
  isSerif: PropTypes.bool,
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
