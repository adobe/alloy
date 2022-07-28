/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default ({
  window,
  getLinkName,
  getLinkRegion,
  getAbsoluteUrlFromAnchorElement,
  findSupportedAnchorElement,
  determineLinkType
}) => {
  return ({ targetElement, config }) => {
    // Search parent elements for an anchor element
    // TODO: Replace with generic DOM tool that can fetch configured properties
    const anchorElement = findSupportedAnchorElement(targetElement);
    if (!anchorElement) {
      return undefined;
    }

    const linkUrl = getAbsoluteUrlFromAnchorElement(window, anchorElement);
    if (!linkUrl) {
      return undefined;
    }

    const linkType = determineLinkType(window, config, linkUrl, anchorElement);
    // TODO: The user provided link click function needs to be called here
    const linkRegion = getLinkRegion(anchorElement);
    const linkName = getLinkName(anchorElement);

    const { onBeforeLinkClickSend } = config;

    const options = {
      xdm: {
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
      },
      data: {},
      clickedElement: targetElement
    };

    const shouldEventBeTracked = onBeforeLinkClickSend(options);

    if (!shouldEventBeTracked) {
      return undefined;
    }

    return options;
  };
};
