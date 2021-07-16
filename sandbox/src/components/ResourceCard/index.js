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

import React, { cloneElement, useEffect, useState } from "react";
import { css } from "@emotion/react";
import { GatsbyLink } from "../GatsbyLink";
import {
  getElementChild,
  layoutColumns,
  getExternalLinkProps,
  TABLET_SCREEN_WIDTH,
  DESKTOP_SCREEN_WIDTH
} from "../../utils";
import "@spectrum-css/typography";
import "@spectrum-css/card";
import PropTypes from "prop-types";

const counter = {
  2: 0,
  3: 0
};
const alignMapping = ["margin-left: 0;", "margin-right: 0;"];

const ResourceCard = ({
  theme = "lightest",
  width = "100%",
  link,
  heading,
  text,
  image
}) => {
  let initColumns = 100 / parseFloat(width);

  if (width === "33%") {
    width = `${(100 / 3).toFixed(2)}%`;
    initColumns = 3;
  }

  const [columns] = useState(initColumns);

  useEffect(() => {
    return () => {
      if (typeof counter[columns] !== "undefined") {
        counter[columns]--;
      }
    };
  }, [columns]);

  if (typeof counter[columns] !== "undefined") {
    counter[columns]++;
  }

  const href = getElementChild(link).props.href;
  let blockWidth = "";
  let extraMargin = "";

  if (columns === 1) {
    blockWidth = `max-width: ${layoutColumns(6)};`;
  } else if (columns > 3) {
    blockWidth = "max-width: var(--spectrum-global-dimension-size-3600);";
  } else {
    blockWidth = "max-width: var(--spectrum-global-dimension-size-4600);";
    extraMargin = alignMapping[counter[columns] % columns];
  }

  return (
    <>
      <section
        className={`spectrum--${theme}`}
        css={css`
          display: ${width === "100%" ? "block" : "table-cell"};
          width: ${width.replace("%", "vw")};
          background: var(--spectrum-global-color-gray-100);
          padding: var(--spectrum-global-dimension-size-1000)
            var(--spectrum-global-dimension-size-400);
          box-sizing: border-box;

          @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
            display: block;
            width: 100%;
          }
        `}
      >
        <GatsbyLink
          className={`spectrum-Card spectrum-Card--vertical`}
          to={href}
          {...getExternalLinkProps(href)}
          css={css`
            display: block;
            margin: auto;
            ${blockWidth}
            ${extraMargin}
  
            @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
              width: 100%;
              min-width: 0;
              margin: auto;
              max-width: ${layoutColumns(6)};
            }
          `}
        >
          <div
            className="spectrum-Card-preview"
            css={css`
              height: var(--spectrum-global-dimension-size-3000);
              width: 100%;
              padding: 0 !important;
            `}
          >
            {image &&
              cloneElement(image, {
                css: css`
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                  width: 100%;
                  margin-bottom: 0 !important;
                  margin-top: 0;

                  .gatsby-resp-image-wrapper {
                    max-width: none !important;
                    width: 100% !important;
                    height: 100% !important;
                  }

                  .gatsby-resp-image-image {
                    object-fit: cover;
                  }
                `
              })}
          </div>
          <div
            className="spectrum-Card-body"
            css={css`
              flex: 1;
              padding: var(--spectrum-global-dimension-size-300) !important;
              justify-content: flex-start !important;
              overflow: hidden;
            `}
          >
            <div
              className="spectrum-Card-header"
              css={css`
                height: auto;
                width: 100%;
              `}
            >
              <div
                className="spectrum-Card-title"
                css={css`
                  white-space: normal;
                  text-align: left;
                `}
              >
                <h3
                  className="spectrum-Heading spectrum-Heading--sizeM"
                  css={css`
                    margin-top: 0 !important;
                    margin-bottom: 0 !important;
                  `}
                >
                  {heading && heading.props.children}
                </h3>
              </div>
            </div>
            <div
              className="spectrum-Card-content"
              css={css`
                height: auto;
              `}
            >
              <div className="spectrum-Card-subtitle">
                <p
                  className="spectrum-Body spectrum-Body-S"
                  css={css`
                    text-align: left;
                    color: var(--spectrum-global-color-gray-700);
                    margin-top: 0;
                  `}
                >
                  {text && text.props.children}
                </p>
              </div>
            </div>
          </div>
        </GatsbyLink>
      </section>
      {typeof counter[columns] !== "undefined" &&
      counter[columns] % columns === 0 ? (
        <div aria-hidden="true" />
      ) : null}
    </>
  );
};

ResourceCard.propTypes = {
  theme: PropTypes.string,
  width: PropTypes.oneOf(["100%", "50%", "33%"]),
  link: PropTypes.element,
  heading: PropTypes.element,
  text: PropTypes.element,
  image: PropTypes.element
};

export { ResourceCard };
