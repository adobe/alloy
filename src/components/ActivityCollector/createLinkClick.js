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
import getLinkName from "./getLinkName";
import getLinkRegion from "./getLinkRegion";

const determineLinkType = (window, config, linkUrl, clickedObj) => {
  let linkType = "other";
  if (isDownloadLink(config.downloadLinkQualifier, linkUrl, clickedObj)) {
    linkType = "download";
  } else if (isExitLink(window, linkUrl)) {
    linkType = "exit";
  }
  return linkType;
};

const findSupportedAnchorElement = targetElement => {
  let node = targetElement;
  while (node) {
    if (isSupportedAnchorElement(node)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
};

export default (window, config) => {
  const linkClickCollectionEnabled = config.linkClickCollectionEnabled;

  return (event, targetElement) => {
    if (!linkClickCollectionEnabled) {
      return;
    }

    // Search parent elements for an anchor element
    // TODO: Replace with generic DOM tool that can fetch configured properties
    const anchorElement = findSupportedAnchorElement(targetElement);
    if (!anchorElement) {
      return;
    }

    const linkUrl = getAbsoluteUrlFromAnchorElement(window, anchorElement);
    if (!linkUrl) {
      return;
    }

    const linkType = determineLinkType(window, config, linkUrl, anchorElement);
    // TODO: The user provided link click function needs to be called here
    const linkRegion = getLinkRegion(anchorElement);
    const linkName = getLinkName(anchorElement);
    // console.log("Link name: ", linkName);
    // console.log("Link region: ", linkRegion);

    event.documentMayUnload();
    event.mergeXdm({
      eventType: "web.webinteraction.linkClicks",
      web: {
        webInteraction: {
          name: linkName,
          region: linkRegion,
          type: linkType,
          URL: linkUrl,
          linkClicks: {
            value: 1
          }
        }
      }
    });
  };
};
