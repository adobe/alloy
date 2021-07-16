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

import React, { useEffect, cloneElement } from "react";
import { css } from "@emotion/react";
import PropTypes from "prop-types";
import { Accordion, AccordionItem } from "../Accordion";

const ANCHOR = "a";

const jsDocFilter = childrenArray => {
  const filteredArray = [];
  let jsDoc = null;
  let jsDocItems = [];
  let headingLevel = -1;

  for (let i = 0; i < childrenArray.length; i++) {
    let type = childrenArray[i]?.props?.mdxType;
    if (!jsDoc && type !== "JsDocParameters") {
      // We are not in a JS Doc block so return the current element
      filteredArray.push(childrenArray[i]);
    } else if (type === "JsDocParameters") {
      // We found a JS Doc block so save a pointer to it
      jsDoc = childrenArray[i];
    } else if (jsDoc) {
      // We are inside a JS Doc Block so we need to add children to it.
      if (type.match(/h\d/)) {
        // We found a header, so we need to check it's level (1-6)
        let level = parseInt(type.charAt(1), 10);
        if (level >= headingLevel) {
          // The heading is >= the current level so we are still in a JS Block
          headingLevel = level;
          jsDocItems.push(childrenArray[i]);
        } else {
          // The heading is less than current level so we are out of the JS Doc Block
          // Pop the previous child, the anchor, off the JS Doc block and onto the page
          filteredArray.push(jsDocItems.pop());

          // Finish the JS Doc Block
          filteredArray.push(
            cloneElement(jsDoc, {
              items: jsDocItems
            })
          );

          // Reset for the next loop
          jsDoc = null;
          jsDocItems = [];
          headingLevel = -1;

          // Push the header onto the page
          filteredArray.push(childrenArray[i]);
        }
      } else {
        // We are in a JS Doc block and the element is not a header
        // so add it to the JS Doc Block
        jsDocItems.push(childrenArray[i]);
      }
    }
  }

  // If we finished parsing all the elements but there is a
  // open JS Doc Block, finish it off
  if (jsDoc) {
    filteredArray.push(
      cloneElement(jsDoc, {
        items: jsDocItems
      })
    );
  }

  return filteredArray;
};

const JsDocParameters = ({ items }) => {
  const createAccordionItems = items => {
    const acc = [];
    let header = "";
    let body = [];
    let id = "";
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let type = item.props.mdxType;
      if (type === ANCHOR) {
        if (body.length > 0) {
          // create new Item
          acc.push(
            <AccordionItem uppercase={false} header={header} id={id} key={id}>
              {body}
            </AccordionItem>
          );
          body = [];
        }
        id = item.props.id;
      } else if (type.match(/h\d/)) {
        header = item.props.children;
      } else {
        body.push(item);
      }
    }

    acc.push(
      <AccordionItem uppercase={false} header={header} id={id} key={id}>
        {body}
      </AccordionItem>
    );

    return acc;
  };

  useEffect(() => {
    window.addEventListener("popstate", shouldOpenAccordion);
    return () => window.removeEventListener("popstate", shouldOpenAccordion);
  }, []);

  const shouldOpenAccordion = event => {
    const hash = event.target.location.hash
      ? event.target.location.hash.substring(1)
      : null;
    const el = document.getElementById(hash);
    if (el?.classList.contains("spectrum-Accordion-item")) {
      el.classList.add("is-open");
    }
  };

  return (
    <div
      css={css`
        .spectrum-Accordion-itemHeader {
          font-size: var(--spectrum-global-dimension-font-size-200);
        }

        .spectrum-Accordion-itemContent {
          padding-top: var(--spectrum-global-dimension-size-100);
        }
      `}
    >
      <Accordion>{createAccordionItems(items)}</Accordion>
    </div>
  );
};

JsDocParameters.propTypes = {
  items: PropTypes.array
};

export { JsDocParameters, jsDocFilter };
