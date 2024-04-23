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

import createClickActivityStorage from "./createClickActivityStorage";
import createClickedElementProperties from "./createClickedElementProperties";

export default ({
  window,
  getLinkName,
  getLinkRegion,
  getAbsoluteUrlFromAnchorElement,
  findClickableElement,
  determineLinkType
}) => {
  return ({ clickedElement, config }) => {
    const {
      onBeforeLinkClickSend: optionsFilter, // Deprecated
      clickCollection
    } = config;
    const { filterClickedElementProperties: propertyFilter } = clickCollection;
    const clickActivityStorage = createClickActivityStorage({
      config,
      window
    });
    const elementProperties = createClickedElementProperties();
    if (clickedElement) {
      const clickableElement = findClickableElement(clickedElement);
      if (clickableElement) {
        elementProperties.clickedElement = clickedElement;
        elementProperties.linkUrl = getAbsoluteUrlFromAnchorElement(
          window,
          clickableElement
        );
        elementProperties.linkType = determineLinkType(
          window,
          config,
          elementProperties.linkUrl,
          clickableElement
        );
        elementProperties.linkRegion = getLinkRegion(clickableElement);
        elementProperties.linkName = getLinkName(clickableElement);
        elementProperties.pageIDType = 0;
        elementProperties.pageName = window.location.href;
        // Check if we have a page-name stored from an earlier page view event
        const storedLinkData = clickActivityStorage.load();
        if (storedLinkData && storedLinkData.pageName) {
          elementProperties.pageName = storedLinkData.pageName;
          // Perhaps pageIDType should be established after customer filter is applied
          // Like if pageName starts with "http" then pageIDType = 0
          elementProperties.pageIDType = 1;
        }
        // If defined, run user provided filter function
        if (propertyFilter) {
          // clickCollection.filterClickedElementProperties
          elementProperties.applyPropertyFilter(propertyFilter);
        } else if (optionsFilter) {
          // onBeforeLinkClickSend
          elementProperties.applyOptionsFilter(optionsFilter);
        }
      }
    }
    return elementProperties;
  };
};
