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

import attachClickActivityCollector from "./attachClickActivityCollector.js";
import configValidators from "./configValidators.js";
import createInjectClickedElementProperties from "./createInjectClickedElementProperties.js";
import createRecallAndInjectClickedElementProperties from "./createRecallAndInjectClickedElementProperties.js";
import createGetClickedElementProperties from "./createGetClickedElementProperties.js";
import createClickActivityStorage from "./createClickActivityStorage.js";
import createStorePageViewProperties from "./createStorePageViewProperties.js";
import validateClickCollectionConfig from "./validateClickCollectionConfig.js";
import getLinkName from "./getLinkName.js";
import getLinkRegion from "./getLinkRegion.js";
import getAbsoluteUrlFromAnchorElement from "./utils/dom/getAbsoluteUrlFromAnchorElement.js";
import findClickableElement from "./utils/dom/findClickableElement.js";
import determineLinkType from "./utils/determineLinkType.js";
import hasPageName from "./utils/hasPageName.js";
import createTransientStorage from "./utils/createTransientStorage.js";
import { injectStorage } from "../../utils/index.js";

const getClickedElementProperties = createGetClickedElementProperties({
  window,
  getLinkName,
  getLinkRegion,
  getAbsoluteUrlFromAnchorElement,
  findClickableElement,
  determineLinkType,
});

let clickActivityStorage;
const initClickActivityStorage = (config) => {
  if (!clickActivityStorage) {
    const createNamespacedStorage = injectStorage(window);
    const nameSpacedStorage = createNamespacedStorage(config.orgId || "");
    // Use transient in-memory if sessionStorage is disabled
    const transientStorage = createTransientStorage();
    const storage = config.clickCollection.sessionStorageEnabled
      ? nameSpacedStorage.session
      : transientStorage;
    clickActivityStorage = createClickActivityStorage({ storage });
  }
};

const createActivityCollector = ({
  config,
  eventManager,
  handleError,
  logger,
}) => {
  validateClickCollectionConfig(config, logger);

  const clickCollection = config.clickCollection;
  if (!clickActivityStorage) {
    initClickActivityStorage(config);
  }

  const injectClickedElementProperties = createInjectClickedElementProperties({
    config,
    logger,
    clickActivityStorage,
    getClickedElementProperties,
  });

  const recallAndInjectClickedElementProperties =
    createRecallAndInjectClickedElementProperties({
      clickActivityStorage,
    });

  const storePageViewProperties = createStorePageViewProperties({
    clickActivityStorage,
  });

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { lifecycle } = tools;
        attachClickActivityCollector({
          eventManager,
          lifecycle,
          handleError,
        });
        // TODO: createScrollActivityCollector ...
      },
      onClick({ event, clickedElement }) {
        injectClickedElementProperties({
          event,
          clickedElement,
        });
      },
      onBeforeEvent({ event }) {
        if (hasPageName(event)) {
          if (clickCollection.eventGroupingEnabled) {
            recallAndInjectClickedElementProperties(event);
          }
          storePageViewProperties(event, logger, clickActivityStorage);
        }
      },
    },
  };
};

createActivityCollector.namespace = "ActivityCollector";
createActivityCollector.configValidators = configValidators;
createActivityCollector.buildOnInstanceConfiguredExtraParams = ({
  config,
  logger,
}) => {
  if (!clickActivityStorage) {
    initClickActivityStorage(config);
  }
  return {
    getLinkDetails: (targetElement) => {
      return getClickedElementProperties({
        clickActivityStorage,
        clickedElement: targetElement,
        config,
        logger,
      }).properties;
    },
  };
};

export default createActivityCollector;
