/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  getAbsoluteUrlFromAnchorElement,
  isSupportedAnchorElement
} from "../utils";

const createClickHandler = (logger, collect) => {
  return event => {
    // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
    let clickedObj = event.target;
    let linkUrl = getAbsoluteUrlFromAnchorElement(window, clickedObj);
    // Search parent elements for an anchor element
    // TODO: Replace with generic DOM tool that can fetch configured properties
    while (clickedObj && clickedObj !== document.body && !linkUrl) {
      clickedObj = clickedObj.parentElement || clickedObj.parentNode;
      if (clickedObj) {
        linkUrl = getAbsoluteUrlFromAnchorElement(window, clickedObj);
      }
    }
    if (linkUrl && isSupportedAnchorElement(clickedObj)) {
      // TODO: Update name (link name) and support exit, other, and download link types
      collect({
        data: {
          eventType: "web.webinteraction",
          name: "Link Click",
          type: "other",
          URL: linkUrl,
          linkClicks: {
            value: 1
          }
        }
      });
    }
  };
};

export default (config, logger, collect) => {
  const enabled = config.get("clickCollectionEnabled");
  if (!enabled) {
    logger.log("Click activity collection is disabled");
    return;
  }
  const clickHandler = createClickHandler(logger, collect);
  document.addEventListener("click", clickHandler, true);
};
