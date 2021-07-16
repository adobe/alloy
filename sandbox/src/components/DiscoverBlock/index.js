/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, { cloneElement } from "react";
import { css } from "@emotion/react";
import { layoutColumns, TABLET_SCREEN_WIDTH } from "../../utils";
import PropTypes from "prop-types";

const imageWidth = "var(--spectrum-global-dimension-size-1250)";

const DiscoverBlock = ({
  width = layoutColumns(3, ["var(--spectrum-global-dimension-size-500)"]),
  heading,
  link,
  text,
  image
}) => (
  <>
    {image
      ? cloneElement(heading, {
          css: css`
            margin-left: calc(
              ${imageWidth} + var(--spectrum-global-dimension-size-400)
            );

            @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
              margin-left: 0;
            }
          `
        })
      : heading}
    <div
      css={css`
        ${image
          ? `
        position: relative;
        margin-left: calc(${imageWidth} + var(--spectrum-global-dimension-size-400));
        width: ${layoutColumns(2)};
        `
          : `width: ${width};`}
        display: inline-flex;
        flex-direction: column;
        margin-right: var(--spectrum-global-dimension-size-400);
        margin-top: var(--spectrum-global-dimension-size-200);

        p {
          margin-top: 0;
        }

        @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
          display: flex;
          width: 100%;
          margin: var(--spectrum-global-dimension-size-200) 0;
        }
      `}
    >
      {image &&
        cloneElement(image, {
          css: css`
            position: absolute;
            top: calc(-1 * var(--spectrum-global-dimension-size-450));
            left: calc(
              -1 * (${imageWidth} + var(--spectrum-global-dimension-size-400))
            );
            display: flex;
            align-items: flex-start;
            height: 100%;
            width: ${imageWidth};

            .gatsby-resp-image-wrapper {
              max-width: none !important;
              width: 100% !important;
              height: 100% !important;
            }

            .gatsby-resp-image-image {
              object-fit: contain;
            }

            @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
              position: static;
              margin: var(--spectrum-global-dimension-size-200) 0;
            }
          `
        })}
      {link}
      {text}
    </div>
  </>
);

DiscoverBlock.propTypes = {
  width: PropTypes.string,
  heading: PropTypes.element,
  text: PropTypes.element,
  image: PropTypes.element,
  link: PropTypes.element
};

export { DiscoverBlock };
