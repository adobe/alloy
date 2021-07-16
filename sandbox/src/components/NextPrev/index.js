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
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import { Link as GatsbyLink } from "gatsby";
import "@spectrum-css/typography";
import { Link } from "../Link";
import { ChevronLeft } from "../WorkflowIcons";
import { ChevronRight } from "../WorkflowIcons";

const NextPrev = ({ nextPage, previousPage }) =>
  nextPage || previousPage ? (
    <div className="spectrum-Body spectrum-Body--sizeM">
      <div
        css={css`
          display: flex;
          margin-bottom: var(--spectrum-global-dimension-size-800);
          margin-top: var(--spectrum-global-dimension-size-800);
        `}
      >
        <div>
          {previousPage && (
            <Link isQuiet={true}>
              <GatsbyLink to={previousPage.href} rel="prev">
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <ChevronLeft />
                  <div
                    css={css`
                      margin-left: var(--spectrum-global-dimension-size-50);
                    `}
                  >
                    {previousPage.title}
                  </div>
                </div>
              </GatsbyLink>
            </Link>
          )}
        </div>
        <div
          css={css`
            margin-left: auto;
            padding-left: var(--spectrum-global-dimension-size-200);
          `}
        >
          {nextPage && (
            <Link isQuiet={true}>
              <GatsbyLink to={nextPage.href} rel="next">
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <div
                    css={css`
                      margin-right: var(--spectrum-global-dimension-size-50);
                    `}
                  >
                    {nextPage.title}
                  </div>
                  <ChevronRight />
                </div>
              </GatsbyLink>
            </Link>
          )}
        </div>
      </div>
    </div>
  ) : null;

NextPrev.propTypes = {
  nextPage: PropTypes.object,
  previousPage: PropTypes.object
};

export { NextPrev };
