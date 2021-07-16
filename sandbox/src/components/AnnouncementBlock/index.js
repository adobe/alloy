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
import "@spectrum-css/typography";
import { AnchorButton } from "../AnchorButton";
import PropTypes from "prop-types";
import { getElementChild, TABLET_SCREEN_WIDTH } from "../../utils";
import classNames from "classnames";

const AnnouncementBlock = ({
  className,
  heading,
  text,
  button,
  theme = "light"
}) => {
  const link = getElementChild(button);

  return (
    <section
      className={classNames(className, `spectrum--${theme}`)}
      css={css`
        display: flex;
        background: var(--spectrum-global-color-gray-100);
        box-sizing: border-box;
        text-align: center;
        height: calc(
          var(--spectrum-global-dimension-size-2000) +
            var(--spectrum-global-dimension-size-125)
        );

        p {
          margin-top: 0;
        }

        @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
          padding: var(--spectrum-global-dimension-size-400);
          height: auto;
        }
      `}
    >
      <div
        css={css`
          margin: auto;
        `}
      >
        {heading && (
          <h3
            className="spectrum-Heading spectrum-Heading--sizeM"
            css={css`
              margin-top: 0 !important;
              margin-bottom: var(
                --spectrum-global-dimension-size-100
              ) !important;
            `}
          >
            {heading.props.children}
          </h3>
        )}

        {text &&
          cloneElement(text, {
            className: "spectrum-Body spectrum-Body--sizeM"
          })}

        {link && (
          <div
            css={css`
              margin-top: var(--spectrum-global-dimension-size-200);
            `}
          >
            <AnchorButton href={link.props.href} variant="primary">
              {link.props.children}
            </AnchorButton>
          </div>
        )}
      </div>
    </section>
  );
};

AnnouncementBlock.propTypes = {
  heading: PropTypes.element,
  text: PropTypes.element,
  button: PropTypes.element,
  theme: PropTypes.string
};

export { AnnouncementBlock };
