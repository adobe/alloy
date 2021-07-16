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

import React, { useRef, useEffect, useState, createRef } from "react";
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import {
  Tabs,
  Item as TabsItem,
  Label as TabsItemLabel,
  TabsIndicator,
  positionIndicator
} from "../Tabs";
import { Picker } from "../Picker";

const CodeBlock = props => {
  const [tabs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState({
    tab: 0,
    language: 0
  });
  const selectedTabIndicator = useRef(null);

  const positionSelectedTabIndicator = (index = selectedIndex.tab) => {
    const selectedTab = tabs.filter(tab => tab.current)[index];
    positionIndicator(selectedTabIndicator, selectedTab);
  };

  useEffect(() => {
    positionSelectedTabIndicator();
  }, [tabs]);

  const { theme } = props;
  const codeBlocks = [];
  const propKeys = Object.keys(props);
  const filteredCodeProps = propKeys.filter(key => key.startsWith("code"));
  const filteredHeadingProps = propKeys.filter(key =>
    key.startsWith("heading")
  );
  const languages = props.languages.split(",").map(language => language.trim());

  // A code language maps to a code content but one tab heading can have multiple codes
  const ignoredHeadings = [];
  filteredHeadingProps.forEach((headingI, i) => {
    if (!ignoredHeadings.includes(headingI)) {
      codeBlocks.push({
        heading: headingI,
        code: [filteredCodeProps[i]],
        languages: [languages[i]]
      });

      const headingTextI = props[headingI].props.children;

      filteredHeadingProps.forEach((headingK, k) => {
        if (headingI !== headingK) {
          const headingTextK = props[headingK].props.children;

          if (headingTextI === headingTextK) {
            const block = codeBlocks.find(block => block.heading === headingI);
            if (block) {
              block.code.push(filteredCodeProps[k]);
              block.languages.push(languages[k]);
              ignoredHeadings.push(headingK);
            }
          }
        }
      });
    }
  });

  const backgroundColor = `background-color: var(--spectrum-global-color-gray-${
    theme === "light" ? "200" : "50"
  });`;

  return (
    <div
      className={`spectrum--${theme}`}
      css={css`
        ${backgroundColor}
        margin: var(--spectrum-global-dimension-size-400) 0;
        border-top-left-radius: var(--spectrum-global-dimension-size-50);
        border-top-right-radius: var(--spectrum-global-dimension-size-50);
      `}
    >
      <div
        css={css`
          display: flex;
          width: 100%;
          height: var(--spectrum-global-dimension-size-600);
        `}
      >
        <Tabs
          css={css`
            padding-left: var(--spectrum-global-dimension-size-200);
            box-sizing: border-box;
          `}
          onFontsReady={positionSelectedTabIndicator}
        >
          {codeBlocks.map((block, index) => {
            const ref = createRef();
            tabs.push(ref);

            const isSelected = selectedIndex.tab === index;

            return (
              <TabsItem
                key={index}
                ref={ref}
                selected={isSelected}
                tabIndex={0}
                onClick={() => {
                  const index = tabs.filter(tab => tab.current).indexOf(ref);
                  setSelectedIndex({
                    tab: index,
                    // Set language index to 0 when switching between tabs
                    language: 0
                  });
                  positionSelectedTabIndicator(index);
                }}
              >
                <TabsItemLabel>
                  {props[block.heading].props.children}
                </TabsItemLabel>
              </TabsItem>
            );
          })}
          <TabsIndicator ref={selectedTabIndicator} />
        </Tabs>
        <div
          css={css`
            display: flex;
            align-items: center;
            margin-left: auto;
            padding-right: var(--spectrum-global-dimension-size-200);
          `}
        >
          {codeBlocks.map(
            (block, i) =>
              selectedIndex.tab === i && (
                <Picker
                  key={i}
                  isQuiet
                  items={codeBlocks[i].languages.map((language, k) => ({
                    title: language,
                    selected: k === selectedIndex.language
                  }))}
                  onChange={index => {
                    setSelectedIndex({
                      tab: selectedIndex.tab,
                      language: index
                    });
                  }}
                />
              )
          )}
        </div>
      </div>
      {codeBlocks.map((block, i) =>
        block.code.map((code, k) => (
          <div
            css={css`
              & pre {
                margin-top: 0;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
              }
            `}
            key={k}
            hidden={!(selectedIndex.tab === i && selectedIndex.language === k)}
          >
            {props[code]}
          </div>
        ))
      )}
    </div>
  );
};

CodeBlock.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]),
  heading: PropTypes.element,
  code: PropTypes.element
};

export { CodeBlock };
