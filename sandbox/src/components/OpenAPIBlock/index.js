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

import React, { useState, useEffect } from "react";
import { css } from "@emotion/react";
import { withPrefix } from "gatsby";
import { ProgressCircle } from "../ProgressCircle";
import { RedocStandalone } from "redoc";
import { Footer } from "../Footer";
import { SIDENAV_WIDTH, isExternalLink } from "../../utils";
import PropTypes from "prop-types";

const OpenAPIBlock = ({ src }) => {
  const [showProgress, setShowProgress] = useState(true);

  let input = {};
  if (isExternalLink(src)) {
    input.specUrl = src;
  } else {
    input.spec = withPrefix(src);
  }

  useEffect(() => {
    if (!showProgress) {
      setShowProgress(true);
    }
  }, [src]);

  return (
    <>
      <div
        css={css`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: ${showProgress ? "grid" : "none"};
          place-items: center center;
        `}
      >
        <ProgressCircle size="L" />
      </div>

      <div
        hidden={showProgress}
        css={css`
          height: calc(100% - var(--spectrum-global-dimension-size-800));
        `}
      >
        <div
          css={css`
            & {
              * {
                font-smoothing: auto !important;
                -webkit-font-smoothing: auto !important;
              }

              [role="navigation"] {
                padding: var(--spectrum-global-dimension-static-size-400);

                label span[type] {
                  text-transform: uppercase;
                  border-radius: var(--spectrum-global-dimension-size-50);
                  font-size: var(--spectrum-global-dimension-size-100);
                  margin-right: var(
                    --spectrum-global-dimension-size-100,
                    var(--spectrum-alias-size-100)
                  );
                  padding: var(--spectrum-global-dimension-size-50)
                    var(--spectrum-global-dimension-size-125);
                  background-color: inherit;
                  width: var(--spectrum-global-dimension-size-700);
                  height: var(--spectrum-global-dimension-size-1);
                }

                label span[type="get"] {
                  border: 2px solid var(--spectrum-global-color-blue-400);
                  color: var(--spectrum-global-color-blue-400);
                }

                label span[type="patch"] {
                  border: 2px solid var(--spectrum-global-color-seafoam-400);
                  color: var(--spectrum-global-color-seafoam-400);
                }

                label span[type="post"] {
                  border: 2px solid var(--spectrum-global-color-green-400);
                  color: var(--spectrum-global-color-green-400);
                }

                label span[type="put"] {
                  border: 2px solid var(--spectrum-global-color-orange-400);
                  color: var(--spectrum-global-color-orange-400);
                }

                label span[type="head"] {
                  border: 2px solid var(--spectrum-global-color-fuchsia-400);
                  color: var(--spectrum-global-color-fuchsia-400);
                }

                label span[type="delete"] {
                  border: 2px solid var(--spectrum-global-color-red-400);
                  color: var(--spectrum-global-color-red-400);
                }

                [role="menuitem"] {
                  position: relative;
                  display: inline-flex;
                  align-items: center;
                  justify-content: left;
                  box-sizing: border-box;
                  margin-top: var(
                    --spectrum-sidenav-item-gap,
                    var(--spectrum-global-dimension-size-50)
                  );
                  margin-bottom: var(
                    --spectrum-sidenav-item-gap,
                    var(--spectrum-global-dimension-size-50)
                  );
                  width: 100%;
                  color: var(
                    --spectrum-body-text-color,
                    var(--spectrum-alias-text-color)
                  );
                  min-height: var(
                    --spectrum-sidenav-item-height,
                    var(--spectrum-alias-single-line-height)
                  );
                  padding-left: var(
                    --spectrum-sidenav-item-padding-x,
                    var(--spectrum-global-dimension-size-150)
                  );
                  padding-right: var(
                    --spectrum-sidenav-item-padding-x,
                    var(--spectrum-global-dimension-size-150)
                  );
                  padding-top: var(--spectrum-global-dimension-size-65);
                  padding-bottom: var(--spectrum-global-dimension-size-65);
                  border-radius: var(
                    --spectrum-sidenav-item-border-radius,
                    var(--spectrum-alias-border-radius-regular)
                  );
                  text-transform: capitalize;
                  font-size: var(
                    --spectrum-sidenav-item-text-size,
                    var(--spectrum-alias-font-size-default)
                  );
                  font-family: adobe-clean, "Source Sans Pro", -apple-system,
                    BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu,
                    "Trebuchet MS", "Lucida Grande", sans-serif;
                  font-style: normal;
                  text-decoration: none;
                  word-break: break-word;
                  hyphens: auto;
                  cursor: pointer;
                  transition: background-color
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-out,
                    color var(--spectrum-global-animation-duration-100, 130ms)
                      ease-out;

                  &:hover {
                    background-color: var(
                      --spectrum-sidenav-item-background-color-hover,
                      var(--spectrum-alias-highlight-hover)
                    );
                    color: var(
                      --spectrum-sidenav-item-text-color-hover,
                      var(--spectrum-alias-text-color-hover)
                    );
                  }

                  svg {
                    display: none;
                  }
                }

                & > li > [role="menuitem"] {
                  font-weight: var(
                    --spectrum-sidenav-multilevel-main-item-font-weight,
                    var(--spectrum-global-font-weight-bold)
                  );
                }

                & + div {
                  display: none;
                }
              }

              .api-info {
                h1 {
                  font-weight: var(
                    --spectrum-heading-light-xl-emphasis-text-font-weight,
                    var(--spectrum-global-font-weight-light)
                  );
                  font-size: var(
                    --spectrum-heading-xl-text-size,
                    var(--spectrum-alias-heading-xl-text-size)
                  );
                  line-height: var(
                    --spectrum-heading-xl-text-line-height,
                    var(--spectrum-alias-heading-text-line-height)
                  );
                  font-style: var(
                    --spectrum-heading-xl-text-font-style,
                    var(--spectrum-global-font-style-regular)
                  );
                  letter-spacing: var(
                    --spectrum-heading-xl-text-letter-spacing,
                    var(--spectrum-global-font-letter-spacing-none)
                  );
                  text-transform: capitalize;
                  color: var(
                    --spectrum-heading-xl-text-color,
                    var(--spectrum-alias-heading-text-color)
                  );

                  span {
                    font-size: var(
                      --spectrum-body-code-4-text-size,
                      var(--spectrum-alias-font-size-default)
                    );
                  }
                }

                h1 span {
                  float: right;
                  line-height: 36px;
                }

                p {
                  font-size: var(
                    --spectrum-body-l-text-size,
                    var(--spectrum-global-dimension-font-size-300)
                  );
                  font-weight: var(
                    --spectrum-body-l-text-font-weight,
                    var(--spectrum-alias-body-text-font-weight)
                  );
                  line-height: var(
                    --spectrum-body-l-text-line-height,
                    var(--spectrum-alias-body-text-line-height)
                  );
                  font-style: var(
                    --spectrum-body-l-text-font-style,
                    var(--spectrum-global-font-style-regular)
                  );
                  letter-spacing: var(
                    --spectrum-body-l-text-letter-spacing,
                    var(--spectrum-global-font-letter-spacing-none)
                  );
                  text-transform: var(--spectrum-body-l-text-transform, none);
                }
              }

              .api-content {
                table {
                  margin-bottom: var(
                    --spectrum-global-dimension-size-400,
                    var(--spectrum-alias-size-400)
                  );
                  border-collapse: separate;
                  border-spacing: 0;
                }

                tbody {
                  border-width: 1px 0;
                  background-color: var(
                    --spectrum-table-quiet-cell-background-color,
                    var(--spectrum-alias-background-color-transparent)
                  );
                  border-radius: var(--spectrum-table-quiet-border-radius, 0px);
                  border: none;
                  border-color: var(
                    --spectrum-table-border-color,
                    var(--spectrum-alias-border-color-mid)
                  );
                  position: relative;
                  overflow: auto;
                  vertical-align: var(
                    --spectrum-table-cell-vertical-alignment,
                    top
                  );
                }

                tr {
                  position: relative;
                  cursor: pointer;
                  transition: background-color
                    var(--spectrum-global-animation-duration-100, 130ms)
                    ease-in-out;
                  border-bottom: 1px solid
                    var(
                      --spectrum-table-cell-border-color,
                      var(--spectrum-global-color-gray-300)
                    );
                  background-color: var(
                    --spectrum-table-quiet-row-background-color,
                    var(--spectrum-alias-background-color-transparent)
                  );
                  border-top: none;
                }

                td {
                  border-bottom: none;
                  border-right: none;
                  border-left: none;
                  border-top: 1px solid
                    var(
                      --spectrum-table-cell-border-color,
                      var(--spectrum-global-color-gray-300)
                    );
                  color: var(
                    --spectrum-table-cell-text-color,
                    var(--spectrum-alias-text-color)
                  );
                  background-color: var(
                    --spectrum-table-cell-background-color,
                    var(--spectrum-alias-background-color-transparent)
                  );
                  position: relative;

                  box-sizing: border-box;
                  font-size: var(
                    --spectrum-table-cell-text-size,
                    var(--spectrum-alias-font-size-default)
                  );
                  font-weight: var(
                    --spectrum-table-cell-text-font-weight,
                    var(--spectrum-global-font-weight-regular)
                  );
                  line-height: var(
                    --spectrum-table-cell-text-line-height,
                    var(--spectrum-alias-body-text-line-height)
                  );
                  padding-top: var(
                    --spectrum-table-cell-padding-y,
                    var(--spectrum-global-dimension-size-175)
                  );
                  padding-bottom: var(
                    --spectrum-table-cell-padding-y,
                    var(--spectrum-global-dimension-size-175)
                  );
                  padding-left: var(
                    --spectrum-table-cell-padding-x,
                    var(--spectrum-global-dimension-size-200)
                  );
                  padding-right: var(
                    --spectrum-table-cell-padding-x,
                    var(--spectrum-global-dimension-size-200)
                  );
                  min-height: calc(
                    var(
                        --spectrum-table-cell-min-height,
                        var(--spectrum-global-dimension-size-600)
                      ) -
                      var(
                        --spectrum-table-cell-padding-y,
                        var(--spectrum-global-dimension-size-175)
                      ) * 2
                  );
                }

                td[kind="field"] {
                  background-image: none;
                  border-left: none;
                  color: var(
                    --spectrum-code-s-text-color,
                    var(--spectrum-alias-text-color)
                  );
                  font-size: var(
                    --spectrum-code-s-text-size,
                    var(--spectrum-alias-font-size-default)
                  );
                  font-weight: var(
                    --spectrum-code-s-text-font-weight,
                    var(--spectrum-alias-code-text-font-weight-regular)
                  );
                  line-height: var(
                    --spectrum-code-s-text-line-height,
                    var(--spectrum-alias-code-text-line-height)
                  );
                  font-style: var(
                    --spectrum-code-s-text-font-style,
                    var(--spectrum-global-font-style-regular)
                  );
                  letter-spacing: var(
                    --spectrum-code-s-text-letter-spacing,
                    var(--spectrum-global-font-letter-spacing-none)
                  );
                  margin-top: 0;
                  margin-bottom: 0;
                  font-family: var(
                    --spectrum-code-s-text-font-family,
                    var(--spectrum-alias-code-text-font-family)
                  );
                }

                td[kind="field"] span {
                  display: none;
                  color: var(--spectrum-global-color-red-700);
                }

                td[kind="field"] div {
                  margin-left: 0px;
                }

                td button {
                  font-size: var(
                    --spectrum-table-cell-text-size,
                    var(--spectrum-alias-font-size-default)
                  );
                  font-weight: var(
                    --spectrum-table-cell-text-font-weight,
                    var(--spectrum-global-font-weight-regular)
                  );
                  font-family: var(
                    --spectrum-code-s-text-font-family,
                    var(--spectrum-alias-code-text-font-family)
                  );
                }

                td + td div div:first-of-type span + span {
                  display: inline-flex;
                  align-items: center;
                  box-sizing: border-box;
                  margin-top: calc(
                    var(
                        --spectrum-taggroup-tag-gap-y,
                        var(--spectrum-global-dimension-size-100)
                      ) / 2
                  );
                  margin-bottom: calc(
                    var(
                        --spectrum-taggroup-tag-gap-y,
                        var(--spectrum-global-dimension-size-100)
                      ) / 2
                  );
                  margin-left: calc(
                    var(
                        --spectrum-taggroup-tag-gap-x,
                        var(--spectrum-global-dimension-size-100)
                      ) / 2
                  );
                  margin-right: calc(
                    var(
                        --spectrum-taggroup-tag-gap-x,
                        var(--spectrum-global-dimension-size-100)
                      ) / 2
                  );
                  padding-top: 0;
                  padding-bottom: 0;
                  padding-left: calc(
                    var(
                        --spectrum-tag-padding-x,
                        var(--spectrum-global-dimension-size-125)
                      ) -
                      var(
                        --spectrum-tag-border-size,
                        var(--spectrum-alias-border-size-thin)
                      )
                  );
                  padding-right: calc(
                    var(
                        --spectrum-tag-padding-x,
                        var(--spectrum-global-dimension-size-125)
                      ) -
                      var(
                        --spectrum-tag-border-size,
                        var(--spectrum-alias-border-size-thin)
                      )
                  );
                  height: var(
                    --spectrum-tag-height,
                    var(--spectrum-global-dimension-size-300)
                  );
                  max-width: 100%;
                  border-width: var(
                    --spectrum-tag-border-size,
                    var(--spectrum-alias-border-size-thin)
                  );
                  border-style: solid;
                  border-radius: var(--spectrum-global-dimension-size-50);
                  outline: none;
                  user-select: none;
                  transition: border-color
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-in-out,
                    color var(--spectrum-global-animation-duration-100, 130ms)
                      ease-in-out,
                    box-shadow
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-in-out,
                    background-color
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-in-out;
                  color: var(
                    --spectrum-tag-text-color,
                    var(--spectrum-global-color-gray-700)
                  );
                  background-color: var(
                    --spectrum-tag-background-color,
                    var(--spectrum-global-color-gray-75)
                  );
                  border-color: var(
                    --spectrum-tag-border-color,
                    var(--spectrum-global-color-gray-600)
                  );
                }

                code[class*="language-"],
                pre[class*="language-"] {
                  /*   --hljs-color: rgb(227, 227, 227); */
                  color: rgb(227, 227, 227);
                  background: none;
                  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono",
                    monospace;
                  font-size: 1em;
                  text-align: left;
                  text-shadow: none;
                  white-space: pre;
                  word-spacing: normal;
                  word-break: normal;
                  word-wrap: normal;
                  line-height: 1.5;
                  border-radius: 4px;
                  tab-size: 4;
                  hyphens: none;
                }

                /* Code blocks */
                pre[class*="language-"] {
                  padding: 1em;
                  margin: 0.5em 0;
                  overflow: auto;
                }

                :not(pre) > code[class*="language-"],
                pre[class*="language-"] {
                  /* --hljs-background: rgb(47, 47, 47); */
                  background: rgb(47, 47, 47);
                }

                /* Inline code */
                :not(pre) > code[class*="language-"] {
                  color: rgb(227, 227, 227);
                  font-size: 14px;
                  background-color: rgb(50, 50, 50);
                  border-radius: 4px;
                  border-color: rgb(62, 62, 62);
                  padding: 4px;
                  white-space: pre-wrap;
                }

                .token.comment,
                .token.block-comment,
                .token.prolog,
                .token.doctype,
                .token.cdata {
                  /* --hljs-comment-color: rgb(185, 185, 185); */
                  color: rgb(185, 185, 185);
                }

                .token.punctuation {
                  color: rgb(227, 227, 227);
                }

                .token.tag,
                .token.namespace,
                .token.deleted {
                  color: rgb(245, 107, 183);
                }

                .token.boolean,
                .token.number,
                .token.attr-name,
                .token.function,
                .token.function-name {
                  /* --hljs-function-color: rgb(75, 156, 245); */
                  color: rgb(75, 156, 245);
                }

                .token.attr-name {
                  /* --hljs-attribute-color: rgb(144, 144, 250); */
                  color: rgb(144, 144, 250);
                }

                .token.property,
                .token.property.string,
                .token.class-name,
                .token.constant,
                .token.symbol {
                  /* --hljs-literal-color: rgb(180, 131, 240); */
                  color: rgb(180, 131, 240);
                }

                .token.class-name {
                  /* --hljs-class-color: rgb(35, 178, 184);
                 */
                  color: rgb(35, 178, 184);
                }

                .token.selector,
                .token.important,
                .token.atrule,
                .token.keyword,
                .token.builtin {
                  color: rgb(227, 102, 239);
                }

                .token.string,
                .token.char,
                .token.attr-value,
                .token.regex {
                  /* --hljs-string-color: rgb(57, 185, 144); */
                  color: rgb(57, 185, 144);
                }

                .token.variable {
                  /* --hljs-variable-color: rgb(236, 90, 170); */
                  color: rgb(236, 90, 170);
                }

                .token.operator,
                .token.entity,
                .token.url {
                  color: rgb(75, 156, 245);
                }

                .token.important,
                .token.bold {
                  font-weight: bold;
                }
                .token.italic {
                  font-style: italic;
                }

                .token.entity {
                  cursor: help;
                }

                .token.inserted {
                  color: rgb(57, 185, 144);
                }

                button span[type] {
                  text-transform: uppercase;
                  border-radius: var(--spectrum-global-dimension-size-50);
                  font-size: var(--spectrum-global-dimension-size-125);
                  margin-right: var(
                    --spectrum-global-dimension-size-100,
                    var(--spectrum-alias-size-100)
                  );
                  padding: var(--spectrum-global-dimension-size-50)
                    var(--spectrum-global-dimension-size-125);
                  background-color: inherit;
                }

                button span[type="get"] {
                  border: 2px solid var(--spectrum-global-color-blue-400);
                  color: var(--spectrum-global-color-blue-400);
                }

                button span[type="patch"] {
                  border: 2px solid var(--spectrum-global-color-seafoam-400);
                  color: var(--spectrum-global-color-seafoam-400);
                }

                button span[type="post"] {
                  border: 2px solid var(--spectrum-global-color-green-400);
                  color: var(--spectrum-global-color-green-400);
                }

                button span[type="put"] {
                  border: 2px solid var(--spectrum-global-color-orange-400);
                  color: var(--spectrum-global-color-orange-400);
                }

                button span[type="head"] {
                  border: 2px solid var(--spectrum-global-color-fuchsia-400);
                  color: var(--spectrum-global-color-fuchsia-400);
                }

                button span[type="delete"] {
                  border: 2px solid var(--spectrum-global-color-red-400);
                  color: var(--spectrum-global-color-red-400);
                }

                button + div[aria-hidden] div {
                  color: rgb(227, 227, 227);
                  background-color: rgb(50, 50, 50);
                }

                button + div[aria-hidden] div div[role="button"] div {
                  border-color: rgb(90, 90, 90);
                  background-color: rgb(37, 37, 37);
                }

                button + div[aria-hidden] div div[role="button"] div span {
                  color: rgb(227, 227, 227);
                }

                div[data-tabs] ul[role="tablist"] {
                  border-bottom-color: var(
                    --spectrum-tabs-rule-color,
                    rgb(62, 62, 62)
                  );
                  align-items: center;
                  display: flex;
                  position: relative;
                  z-index: 0;
                  margin: 0;
                  padding-top: 0;
                  padding-bottom: 0;
                  padding-left: var(
                    --spectrum-tabs-focus-ring-padding-x,
                    var(--spectrum-global-dimension-size-100)
                  );
                  padding-right: var(
                    --spectrum-tabs-focus-ring-padding-x,
                    var(--spectrum-global-dimension-size-100)
                  );
                  vertical-align: top;
                  background-color: rgb(50, 50, 50);
                }

                div[data-tabs] ul[role="tablist"] li[role="tab"] {
                  position: relative;
                  box-sizing: border-box;
                  height: calc(
                    var(
                        --spectrum-tabs-height,
                        var(--spectrum-global-dimension-size-600)
                      ) -
                      var(
                        --spectrum-tabs-rule-height,
                        var(--spectrum-alias-border-size-thick)
                      )
                  );
                  line-height: calc(
                    var(
                        --spectrum-tabs-height,
                        var(--spectrum-global-dimension-size-600)
                      ) -
                      var(
                        --spectrum-tabs-rule-height,
                        var(--spectrum-alias-border-size-thick)
                      )
                  );
                  z-index: 1;
                  text-decoration: none;
                  white-space: nowrap;
                  transition: color
                    var(--spectrum-global-animation-duration-100, 130ms)
                    ease-out;
                  cursor: pointer;
                  outline: none;
                  color: var(
                    --spectrum-tabs-text-color,
                    var(--spectrum-alias-label-text-color)
                  );
                  cursor: pointer;
                  vertical-align: top;
                  display: inline-block;
                  font-size: var(
                    --spectrum-tabs-text-size,
                    var(--spectrum-alias-font-size-default)
                  );
                  font-weight: var(
                    --spectrum-tabs-text-font-weight,
                    var(--spectrum-alias-body-text-font-weight)
                  );
                  text-decoration: none;
                  background-color: inherit;
                  border: 0px;
                  border-bottom: var(
                      --spectrum-tabs-rule-height,
                      var(--spectrum-alias-border-size-thick)
                    )
                    solid;
                  padding-right: 15px;
                  padding-left: 15px;
                  padding-bottom: 10px;
                  margin-right: 0px;
                  margin-left: 0px;
                  border-radius: 0px;
                }

                div[data-tabs] ul[role="tablist"] li[aria-selected="true"] {
                  color: var(
                    --spectrum-tabs-text-color-selected,
                    var(--spectrum-global-color-gray-400)
                  );
                }

                div[role="tabpanel"] div div + div div div button {
                  position: relative;
                  display: -ms-inline-flexbox;
                  display: inline-flex;
                  box-sizing: border-box;
                  align-items: center;
                  justify-content: center;
                  overflow: visible;
                  margin: 0
                    var(
                      --spectrum-global-dimension-size-100,
                      var(--spectrum-alias-size-100)
                    )
                    0 0;
                  border-style: solid;
                  text-transform: none;
                  vertical-align: top;
                  transition: background
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-out,
                    border-color
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-out,
                    color var(--spectrum-global-animation-duration-100, 130ms)
                      ease-out,
                    box-shadow
                      var(--spectrum-global-animation-duration-100, 130ms)
                      ease-out;
                  text-decoration: none;
                  font-family: var(
                    --spectrum-alias-body-text-font-family,
                    var(--spectrum-global-font-family-base)
                  );
                  line-height: 1.3;
                  user-select: none;
                  touch-action: none;
                  cursor: pointer;
                  position: relative;
                  height: var(
                    --spectrum-actionbutton-height,
                    var(--spectrum-alias-single-line-height)
                  );
                  min-width: var(
                    --spectrum-actionbutton-min-width,
                    var(--spectrum-global-dimension-size-400)
                  );
                  padding: 0
                    calc(
                      var(
                          --spectrum-actionbutton-icon-padding-x,
                          var(--spectrum-global-dimension-size-85)
                        ) -
                        var(
                          --spectrum-actionbutton-border-size,
                          var(--spectrum-alias-border-size-thin)
                        )
                    );
                  border-width: var(
                    --spectrum-actionbutton-border-size,
                    var(--spectrum-alias-border-size-thin)
                  );
                  border-radius: var(
                    --spectrum-actionbutton-border-radius,
                    var(--spectrum-alias-border-radius-regular)
                  );
                  font-size: var(
                    --spectrum-actionbutton-text-size,
                    var(--spectrum-alias-font-size-default)
                  );
                  font-weight: var(
                    --spectrum-actionbutton-text-font-weight,
                    var(--spectrum-alias-body-text-font-weight)
                  );
                  background-color: rgb(47, 47, 47);
                  border-color: rgb(90, 90, 90);
                  color: rgb(227, 227, 227);
                }

                div[data-section-id] h1,
                h2,
                h3,
                h4 {
                  display: flex;
                  flex-direction: row-reverse;
                  justify-content: flex-end;

                  a {
                    margin-left: 4px;
                  }
                }

                h1 {
                  font-size: var(
                    --spectrum-heading-l-text-size,
                    var(--spectrum-alias-heading-l-text-size)
                  );
                  line-height: var(
                    --spectrum-heading-l-text-line-height,
                    var(--spectrum-alias-heading-text-line-height)
                  );
                  font-style: var(
                    --spectrum-heading-l-text-font-style,
                    var(--spectrum-global-font-style-regular)
                  );
                  letter-spacing: var(
                    --spectrum-heading-l-text-letter-spacing,
                    var(--spectrum-global-font-letter-spacing-none)
                  );
                  text-transform: capitalize;
                  color: var(
                    --spectrum-heading-l-text-color,
                    var(--spectrum-alias-heading-text-color)
                  );
                }

                h2 {
                  position: relative;
                  font-family: var(
                    --spectrum-alias-body-text-font-family,
                    var(--spectrum-global-font-family-base)
                  );
                  font-size: var(
                    --spectrum-heading-l-text-size,
                    var(--spectrum-alias-heading-l-text-size)
                  );
                  font-weight: var(
                    --spectrum-heading-l-text-font-weight,
                    var(--spectrum-alias-heading-text-font-weight-regular)
                  );
                  line-height: var(
                    --spectrum-heading-l-text-line-height,
                    var(--spectrum-alias-heading-text-line-height)
                  );
                  font-style: var(
                    --spectrum-heading-l-text-font-style,
                    var(--spectrum-global-font-style-regular)
                  );
                  letter-spacing: var(
                    --spectrum-heading-l-text-letter-spacing,
                    var(--spectrum-global-font-letter-spacing-none)
                  );
                  text-transform: capitalize;
                  color: var(
                    --spectrum-heading-l-text-color,
                    var(--spectrum-alias-heading-text-color)
                  );
                  margin-top: var(
                    --spectrum-heading-l-margin-top,
                    var(--spectrum-alias-heading-l-margin-top)
                  );
                  margin-bottom: var(
                    --spectrum-global-dimension-size-400,
                    var(--spectrum-alias-size-300)
                  );

                  &:after {
                    content: "";
                    border-radius: var(
                      --spectrum-global-dimension-static-size-25
                    );
                    background-color: var(
                      --spectrum-heading-l-text-color,
                      var(--spectrum-alias-heading-text-color)
                    );
                    height: var(--spectrum-global-dimension-static-size-50);
                    width: 100%;
                    position: absolute;
                    left: 0;
                    bottom: calc(
                      -1 * var(--spectrum-global-dimension-static-size-100)
                    );
                  }

                  ~ div {
                    p,
                    ul {
                      font-size: var(
                        --spectrum-body-m-text-size,
                        var(--spectrum-global-dimension-font-size-200)
                      );
                      font-weight: var(
                        --spectrum-body-m-text-font-weight,
                        var(--spectrum-alias-body-text-font-weight)
                      );
                      line-height: var(
                        --spectrum-body-m-text-line-height,
                        var(--spectrum-alias-body-text-line-height)
                      );
                      font-style: var(
                        --spectrum-body-m-text-font-style,
                        var(--spectrum-global-font-style-regular)
                      );
                      letter-spacing: var(
                        --spectrum-body-m-text-letter-spacing,
                        var(--spectrum-global-font-letter-spacing-none)
                      );
                      text-transform: var(
                        --spectrum-body-m-text-transform,
                        none
                      );
                    }
                  }
                }

                h3,
                h5 {
                  font-size: var(
                    --spectrum-body-m-text-size,
                    var(--spectrum-global-dimension-font-size-200)
                  );
                  font-weight: var(
                    --spectrum-body-xl-strong-text-font-weight,
                    var(--spectrum-global-font-weight-bold)
                  );
                  line-height: var(
                    --spectrum-body-m-text-line-height,
                    var(--spectrum-alias-body-text-line-height)
                  );
                  font-style: var(
                    --spectrum-body-m-text-font-style,
                    var(--spectrum-global-font-style-regular)
                  );
                  letter-spacing: var(
                    --spectrum-body-m-text-letter-spacing,
                    var(--spectrum-global-font-letter-spacing-none)
                  );
                  text-transform: var(--spectrum-body-m-text-transform, none);
                  margin-top: 0;
                  margin-bottom: var(
                    --spectrum-global-dimension-size-200,
                    var(--spectrum-alias-size-200)
                  );
                  color: var(
                    --spectrum-body-text-color,
                    var(--spectrum-alias-text-color)
                  );
                  text-transform: capitalize;
                  border-bottom: 0px;
                }

                h5 span {
                  float: right;
                }

                h5 + div p {
                  margin-bottom: var(
                    --spectrum-global-dimension-size-200,
                    var(--spectrum-alias-size-200)
                  );
                }

                pre {
                  border-radius: var(
                    --spectrum-global-dimension-static-size-50
                  );

                  code {
                    border-radius: var(
                      --spectrum-global-dimension-static-size-50
                    );
                    font-size: var(
                      --spectrum-body-code-4-text-size,
                      var(--spectrum-alias-font-size-default)
                    );
                    font-weight: var(
                      --spectrum-body-code-4-text-font-weight,
                      var(--spectrum-alias-code-text-font-weight-regular)
                    );
                    line-height: var(
                      --spectrum-body-code-4-text-line-height,
                      var(--spectrum-alias-code-text-line-height)
                    );
                    font-style: var(
                      --spectrum-body-code-4-text-font-style,
                      var(--spectrum-global-font-style-regular)
                    );
                    letter-spacing: var(
                      --spectrum-body-code-4-text-letter-spacing,
                      var(--spectrum-global-font-letter-spacing-none)
                    );
                    font-family: var(
                      --spectrum-body-code-4-text-font-family,
                      var(--spectrum-alias-code-text-font-family)
                    );
                  }
                }

                div div div div div button {
                  border-radius: 0px;
                  z-index: inherit;
                  position: relative;
                  display: list-item;
                  margin: 0;
                  border-bottom: var(
                      --spectrum-accordion-item-border-size,
                      var(--spectrum-alias-border-size-thin)
                    )
                    solid
                    var(
                      --spectrum-table-cell-border-color,
                      var(--spectrum-global-color-gray-300)
                    );
                  color: var(
                    --spectrum-body-text-color,
                    var(--spectrum-alias-text-color)
                  );
                  background-color: inherit;

                  &:hover {
                    color: var(--spectrum-global-color-gray-900);
                    background-color: var(--spectrum-global-color-gray-200);
                  }

                  &:focus {
                    outline-color: transparent;
                  }
                }

                div div div div div button svg {
                  filter: brightness(0) saturate(100%) invert(61%) sepia(6%)
                    saturate(11%) hue-rotate(13deg) brightness(91%)
                    contrast(86%);
                  padding-right: 6px;
                }

                div div div div div button[aria-expanded="true"] {
                  border-bottom: var(
                      --spectrum-accordion-item-border-size,
                      var(--spectrum-alias-border-size-thin)
                    )
                    solid transparent;
                }

                a[href] {
                  color: var(
                    --spectrum-link-text-color,
                    var(--spectrum-global-color-blue-600)
                  );

                  &:hover {
                    text-decoration: underline;
                  }
                }

                a[download] {
                  margin: 0;
                  border: none;
                }
              }
            }
          `}
        >
          <RedocStandalone
            {...input}
            options={{
              nativeScrollbars: true,
              disableSearch: true,
              hideLoading: true,
              scrollYOffset: 64,
              menuToggle: true,
              theme: {
                sidebar: {
                  width: SIDENAV_WIDTH
                },
                rightPanel: {
                  backgroundColor: "rgb(37, 37, 37)"
                },
                codeBlock: {
                  backgroundColor: "rgb(50, 50, 50)"
                },
                typography: {
                  fontFamily: `adobe-clean, 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Trebuchet MS', 'Lucida Grande', sans-serif`
                }
              }
            }}
            onLoaded={() => {
              setShowProgress(false);
            }}
          />
        </div>

        <Footer />
      </div>
    </>
  );
};

OpenAPIBlock.propTypes = {
  src: PropTypes.string
};

export default OpenAPIBlock;
