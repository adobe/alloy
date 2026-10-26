/*
Copyright 2026 Adobe. All rights reserved.
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
import Heading from "./typography/heading";

const InfoMessage = ({
  title,
  children,
  headingLevel = 5,
  styles,
  "data-test-id": dataTestId,
}) => (
  <div
    data-test-id={dataTestId}
    className={mergeStyles(
      style({
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 400,
        maxWidth: "full",
      }),
      styles,
    )}
  >
    <Heading size="XS" level={headingLevel} marginBottom={0}>
      {title}
    </Heading>
    <div className={style({ font: "body-sm" })}>{children}</div>
  </div>
);

InfoMessage.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  styles: PropTypes.string,
  "data-test-id": PropTypes.string,
};

export default InfoMessage;
