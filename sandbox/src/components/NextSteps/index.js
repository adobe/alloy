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

import React from "react";
import { Link as GatsbyLink } from "gatsby";
import { css } from "@emotion/react";
import { Link } from "../Link";
import "@spectrum-css/typography";
import { FileTxt } from "../WorkflowIcons";
import PropTypes from "prop-types";

const NextSteps = ({ pages }) => {
  return pages.length > 0 ? (
    <div
      css={css`
        margin-top: var(--spectrum-global-dimension-size-800);
      `}
    >
      <h3
        className="spectrum-Heading--S spectrum-Heading--sizeS"
        css={css`
          margin-bottom: var(--spectrum-global-dimension-size-200);
        `}
      >
        Next steps
      </h3>
      <ul
        className="spectrum-Body spectrum-Body--sizeM"
        css={css`
          list-style: none;
          padding: 0;
        `}
      >
        {pages.splice(1).map((page, index) => (
          <li
            key={index}
            css={css`
              display: block;
              height: var(--spectrum-global-dimension-size-500);
            `}
          >
            <Link isQuiet={true}>
              <GatsbyLink to={page.href}>
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <FileTxt />
                  <span
                    css={css`
                      margin-left: var(--spectrum-global-dimension-size-100);
                    `}
                  >
                    {page.title}
                  </span>
                </div>
              </GatsbyLink>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};

NextSteps.propTypes = {
  pages: PropTypes.array
};

export { NextSteps };
