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

const isDissallowedLinkType = (clickCollection, linkType) => {
  return (
    linkType &&
    ((linkType === "download" && !clickCollection.downloadLinkEnabled) ||
      (linkType === "exit" && !clickCollection.externalLinkEnabled) ||
      (linkType === "other" && !clickCollection.internalLinkEnabled))
  );
};

export default ({
  config,
  logger,
  getClickedElementProperties,
  clickActivityStorage
}) => {
  const { clickCollectionEnabled, clickCollection } = config;
  if (!clickCollectionEnabled) {
    return () => undefined;
  }

  return ({ event, targetElement }) => {
    const elementProperties = getClickedElementProperties({
      targetElement,
      config,
      logger
    });
    const linkType = elementProperties.linkType;
    if (
      elementProperties.isValidLink() &&
      isDissallowedLinkType(clickCollection, linkType)
    ) {
      logger.info(
        `Cancelling link click event due to clickCollection.${linkType}LinkEnabled = false.`
      );
    } else if (
      // Determine if element properties should be collected now or be saved
      // for a future page view event.
      elementProperties.isInternalLink() &&
      clickCollection.eventGroupingEnabled
    ) {
      clickActivityStorage.save(elementProperties.properties);
    } else if (elementProperties.isValidLink()) {
      event.mergeXdm(elementProperties.xdm);
      event.setUserData(elementProperties.data);
      clickActivityStorage.save({
        pageName: elementProperties.pageName,
        pageIDType: elementProperties.pageIDType
      });
    } else if (elementProperties.isValidActivityMapData()) {
      clickActivityStorage.save(elementProperties.properties);
    }
  };
};
