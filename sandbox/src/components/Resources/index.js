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

import React, { cloneElement, Children } from "react";
import { css } from "@emotion/react";
import "@spectrum-css/typography";
import PropTypes from "prop-types";
import { layoutColumns } from "../../utils";
import { LinkOut } from "../WorkflowIcons";
import {
  getElementChild,
  isExternalLink,
  TABLET_SCREEN_WIDTH
} from "../../utils";

const Resources = ({ heading, links }) => {
  return (
    <aside
      css={css`
        width: ${layoutColumns(3)};
        margin-left: var(--spectrum-global-dimension-size-400);
        margin-top: var(--spectrum-global-dimension-size-400);

        @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
          display: none;
        }
      `}
    >
      {heading &&
        cloneElement(heading, {
          css: css`
            margin-top: 0;
          `
        })}
      <ul
        className="spectrum-Body spectrum-Body--sizeM"
        css={css`
          list-style: none;
          padding: 0;
        `}
      >
        {Children.map(links.props.children, (item, i) => {
          const link = getElementChild(item);
          const href = link.props.href;

          return (
            <li
              key={i}
              css={css`
                margin-top: var(--spectrum-global-dimension-size-200);
              `}
            >
              <div
                css={css`
                  display: flex;
                `}
              >
                {link}
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    margin-left: var(--spectrum-global-dimension-size-100);
                  `}
                >
                  {isExternalLink(href) && <LinkOut size="XS" />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

Resources.propTypes = {
  heading: PropTypes.element,
  links: PropTypes.element
};

export { Resources };
