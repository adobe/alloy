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

import React, { useEffect, useState, cloneElement } from "react";
import { css } from "@emotion/react";
import { HeroButtons } from "../Hero";
import "@spectrum-css/typography";
import "@spectrum-css/card";
import { DESKTOP_SCREEN_WIDTH, TABLET_SCREEN_WIDTH } from "../../utils";
import PropTypes from "prop-types";

const counter = {
  2: 0,
  3: 0,
  4: 0
};
const alignMapping = ["flex-start", "flex-end"];

const ProductCard = ({
  theme = "lightest",
  width = "100%",
  icon,
  heading,
  text,
  buttons
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

  let alignment = "center";
  if (columns === 2 || columns === 3) {
    alignment = alignMapping[counter[columns] % columns] || "center";
  }

  return (
    <section
      className={`spectrum--${theme}`}
      css={css`
        display: inline-flex;
        flex-direction: column;
        align-items: ${alignment};
        width: ${width};
        padding: var(--spectrum-global-dimension-size-400) 0;
        background: var(--spectrum-global-color-gray-100);

        @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
          display: flex;
          width: 100%;
          align-items: center;
        }
      `}
    >
      <div
        role="figure"
        tabIndex="0"
        className="spectrum-Card"
        css={css`
          margin: 0 var(--spectrum-global-dimension-size-300);
          width: calc(
            var(--spectrum-global-dimension-size-4600) -
              var(--spectrum-global-dimension-size-800)
          );
          height: calc(
            var(--spectrum-global-dimension-size-4600) -
              var(--spectrum-global-dimension-size-500)
          );

          &:hover {
            border-color: var(
              --spectrum-card-border-color,
              var(--spectrum-global-color-gray-200)
            );
          }

          @media screen and (max-width: ${DESKTOP_SCREEN_WIDTH}) {
            width: calc(
              var(--spectrum-global-dimension-size-3600) -
                var(--spectrum-global-dimension-size-800)
            );
          }

          @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
            width: 0;
            margin: 0;
          }
        `}
      >
        <div
          className="spectrum-Card-body"
          css={css`
            height: calc(
              var(--spectrum-global-dimension-size-4600) -
                var(--spectrum-global-dimension-size-500)
            );
            overflow: auto;
            text-align: left;
          `}
        >
          <div
            css={css`
              position: absolute;
              height: var(--spectrum-global-dimension-size-800);
              z-index: 1;
            `}
          >
            {icon &&
              cloneElement(icon, {
                css: css`
                  height: var(--spectrum-global-dimension-size-600);
                  width: var(--spectrum-global-dimension-size-600);
                  margin-top: 0;

                  img {
                    display: block;
                    height: 100%;
                    object-fit: contain;
                  }
                `
              })}
          </div>
          <div
            css={css`
              position: relative;
              z-index: 1;
              background-color: var(--spectrum-global-color-gray-50);
              ${icon ? "top: var(--spectrum-global-dimension-size-800);" : ""}
            `}
          >
            <div
              className="spectrum-Card-header spectrum-Heading spectrum-Heading--sizeXXS"
              css={css`
                margin-top: 0 !important;
                margin-bottom: var(
                  --spectrum-global-dimension-size-100
                ) !important;
              `}
            >
              <div
                className="spectrum-Card-title"
                css={css`
                  font-size: var(--spectrum-global-dimension-size-200);
                `}
              >
                <strong>{heading && heading.props.children}</strong>
              </div>
            </div>
            <div
              className="spectrum-Card-content spectrum-Body spectrum-Body--sizeS"
              css={css`
                height: auto;
                margin-bottom: 0 !important;
              `}
            >
              {text && text.props.children}
            </div>
          </div>
        </div>
        <div className="spectrum-Card-footer">
          <HeroButtons
            buttons={buttons}
            quiets={[true, false]}
            variants={["secondary", "primary"]}
            css={css`
              justify-content: flex-end;

              @media screen and (max-width: ${TABLET_SCREEN_WIDTH}) {
                justify-content: center;
              }
            `}
          />
        </div>
      </div>
    </section>
  );
};

ProductCard.propTypes = {
  theme: PropTypes.string,
  width: PropTypes.oneOf(["100%", "50%", "33%", "25%"]),
  icon: PropTypes.element,
  heading: PropTypes.element,
  text: PropTypes.element,
  buttons: PropTypes.element
};

export { ProductCard };
