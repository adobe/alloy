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

import React, { useEffect, forwardRef } from "react";
import classNames from "classnames";
import "@spectrum-css/tabs";
import { css } from "@emotion/react";

const positionIndicator = (indicator, selectedTab) => {
  indicator.current.style.transform = `translate(${selectedTab.current.offsetLeft}px, 0px)`;
  indicator.current.style.width = `${selectedTab.current.offsetWidth}px`;
};

const animateIndicator = (indicator, animate) => {
  indicator.current.style.transition = animate ? "" : "none";
};

const Tabs = forwardRef(
  ({ children, className, onFontsReady, ...props }, ref) => {
    useEffect(() => {
      // Font affects positioning of the Tab indicator
      document.fonts.ready.then(() => {
        onFontsReady && onFontsReady();
      });
    }, []);

    return (
      <div
        ref={ref}
        {...props}
        className={classNames(
          "spectrum-Tabs",
          "spectrum-Tabs--horizontal",
          "spectrum-Tabs--quiet",
          className
        )}
        role="tablist"
      >
        {children}
      </div>
    );
  }
);

const TabsIndicator = forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={classNames(className, "spectrum-Tabs-selectionIndicator")}
      css={css`
        transition-property: transform, width;
      `}
    ></div>
  );
});

const Item = forwardRef(
  ({ elementType = "div", selected, className, children, ...props }, ref) => {
    const Element = elementType;

    return (
      <Element
        {...props}
        ref={ref}
        role="tab"
        aria-selected={selected ? "true" : "false"}
        className={classNames(className, "spectrum-Tabs-item", {
          "is-selected": selected
        })}
      >
        {children}
      </Element>
    );
  }
);

const Label = ({ children }) => (
  <span className="spectrum-Tabs-itemLabel">{children}</span>
);

export {
  Tabs,
  Item,
  Label,
  TabsIndicator,
  positionIndicator,
  animateIndicator
};
