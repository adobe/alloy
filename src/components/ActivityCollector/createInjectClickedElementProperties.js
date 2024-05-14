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

import activityMapExtensionEnabled from "./utils/activityMapExtensionEnabled";

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

  return ({ event, clickedElement }) => {
    const elementProperties = getClickedElementProperties({
      clickActivityStorage,
      clickedElement,
      config,
      logger
    });
    const linkType = elementProperties.linkType;
    // Avoid clicks to be collected for the ActivityMap interface
    if (activityMapExtensionEnabled()) {
      return;
    }
    if (
      elementProperties.isValidLink() &&
      isDissallowedLinkType(clickCollection, linkType)
    ) {
      logger.info(
        `Cancelling link click event due to clickCollection.${linkType}LinkEnabled = false.`
      );
    } else if (
      // Determine if element properties should be sent with event now, or be saved
      // and grouped with a future page view event.
      // Event grouping is not supported for the deprecated onBeforeLinkClickSend callback
      // because only click properties is saved and not XDM and DATA (which could have been modified).
      // However, if the filterClickDetails callback is available we group events because it takes
      // priority over onBeforeLinkClickSend and only supports processing click properties.
      elementProperties.isInternalLink() &&
      clickCollection.eventGroupingEnabled &&
      (!config.onBeforeLinkClickSend || clickCollection.filterClickDetails)
    ) {
      clickActivityStorage.save(elementProperties.properties);
    } else if (elementProperties.isValidLink()) {
      // Event will be sent
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
