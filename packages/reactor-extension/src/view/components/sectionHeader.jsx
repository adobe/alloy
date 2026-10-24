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

import { Divider, Link, mergeStyles } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import PropTypes from "prop-types";
import Heading from "./typography/heading";

const DIVIDER_STYLE = style({ marginTop: 0, marginBottom: 8 });

// Only the tokens actually passed by callers are mapped. Callers may pass
// either the "size-0" token or a bare 0, so both keys are mapped to the same
// style.
const CONTAINER_MARGIN_TOP_STYLES = {
  0: style({ marginTop: 0 }),
  "size-0": style({ marginTop: 0 }),
  "size-200": style({ marginTop: 16 }),
  "size-400": style({ marginTop: 32 }),
  "size-600": style({ marginTop: 48 }),
};
const CONTAINER_MARGIN_BOTTOM_STYLES = {
  0: style({ marginBottom: 0 }),
  "size-0": style({ marginBottom: 0 }),
  "size-200": style({ marginBottom: 16 }),
};

const SectionHeader = ({
  children,
  learnMoreUrl,
  marginTop = "size-400",
  marginBottom = "size-200",
}) => {
  return (
    <div
      className={mergeStyles(
        CONTAINER_MARGIN_TOP_STYLES[marginTop] ??
          CONTAINER_MARGIN_TOP_STYLES["size-400"],
        CONTAINER_MARGIN_BOTTOM_STYLES[marginBottom] ??
          CONTAINER_MARGIN_BOTTOM_STYLES["size-200"],
      )}
    >
      {marginTop !== 0 && marginTop !== "size-0" && (
        <Divider size="S" styles={DIVIDER_STYLE} />
      )}
      <Heading marginTop={0} marginBottom="size-75">
        {children}
      </Heading>
      {learnMoreUrl && (
        <Link href={learnMoreUrl} target="_blank" rel="noopener noreferrer">
          Learn more
        </Link>
      )}
    </div>
  );
};

SectionHeader.propTypes = {
  children: PropTypes.node.isRequired,
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  learnMoreUrl: PropTypes.string,
};

export default SectionHeader;
