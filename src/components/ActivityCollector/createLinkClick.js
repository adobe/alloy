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
  isSupportedAnchorElement,
  isDownloadLink,
  isExitLink
} from "./utils";

const determineLinkType = (window, config, linkUrl, clickedObj) => {
  let linkType = "other";
  if (isDownloadLink(config.downloadLinkQualifier, linkUrl, clickedObj)) {
    linkType = "download";
  } else if (isExitLink(window, linkUrl)) {
    linkType = "exit";
  }
  return linkType;
};

export default (window, config, clickedObject) => {
  let linkName;
  let linkType;
  let clickedObj = clickedObject;
  let linkUrl = getAbsoluteUrlFromAnchorElement(window, clickedObj);
  let isValidLink = false;
  // Search parent elements for an anchor element
  // TODO: Replace with generic DOM tool that can fetch configured properties
  while (clickedObj && clickedObj !== document.body && !linkUrl) {
    clickedObj = clickedObj.parentElement || clickedObj.parentNode;
    if (clickedObj) {
      linkUrl = getAbsoluteUrlFromAnchorElement(window, clickedObj);
    }
  }
  if (linkUrl && isSupportedAnchorElement(clickedObj)) {
    isValidLink = true;
    linkType = determineLinkType(window, config, linkUrl, clickedObj);
    // TODO: Update link name from the clicked element context
    linkName = "Link Click";
  }
  return {
    isValid() {
      return isValidLink;
    },
    populateEvent(event) {
      if (linkType === "exit") {
        event.documentUnloading();
      }
      event.mergeXdm({
        eventType: "web.webinteraction.linkClicks",
        web: {
          webinteraction: {
            name: linkName,
            type: linkType,
            URL: linkUrl,
            linkClicks: {
              value: 1
            }
          }
        }
      });
    }
  };
};
