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
  return ({ targetElement, config, logger }) => {
    const anchorElement = findSupportedAnchorElement(targetElement);

    if (!anchorElement) {
      logger.info(
        "This link click event is not triggered because the HTML element is not an anchor."
      );
      return undefined;
    }

    const linkUrl = getAbsoluteUrlFromAnchorElement(window, anchorElement);
    if (!linkUrl) {
      logger.info(
        "This link click event is not triggered because the HTML element doesn't have an URL."
      );
      return undefined;
    }

    const linkType = determineLinkType(window, config, linkUrl, anchorElement);
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
    if (!onBeforeLinkClickSend) {
      return options;
    }

    const shouldEventBeTracked = onBeforeLinkClickSend(options);

    if (shouldEventBeTracked !== false) {
      return options;
    }
    logger.info(
      "This link click event is not triggered because it was canceled in onBeforeLinkClickSend."
    );
    return undefined;
  };
};
