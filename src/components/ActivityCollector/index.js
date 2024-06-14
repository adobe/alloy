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

import attachClickActivityCollector from "./attachClickActivityCollector";
import configValidators from "./configValidators";
import createInjectClickedElementProperties from "./createInjectClickedElementProperties";
import createRecallAndInjectClickedElementProperties from "./createRecallAndInjectClickedElementProperties";
import createGetClickedElementProperties from "./createGetClickedElementProperties";
import createClickActivityStorage from "./createClickActivityStorage";
import createStorePageViewProperties from "./createStorePageViewProperties";
import getLinkName from "./getLinkName";
import getLinkRegion from "./getLinkRegion";
import getAbsoluteUrlFromAnchorElement from "./utils/dom/getAbsoluteUrlFromAnchorElement";
import findClickableElement from "./utils/dom/findClickableElement";
import determineLinkType from "./utils/determineLinkType";
import hasPageName from "./utils/hasPageName";
import createTransientStorage from "./utils/createTransientStorage";
import { injectStorage } from "../../utils";

const getClickedElementProperties = createGetClickedElementProperties({
  window,
  getLinkName,
  getLinkRegion,
  getAbsoluteUrlFromAnchorElement,
  findClickableElement,
  determineLinkType
});

let clickActivityStorage;

const createActivityCollector = ({
  config,
  eventManager,
  handleError,
  logger
}) => {
  const clickCollection = config.clickCollection;
  const createNamespacedStorage = injectStorage(window);
  const nameSpacedStorage = createNamespacedStorage(config.orgId || "");
  // Use transient in-memory if sessionStorage is disabled
  const transientStorage = createTransientStorage();
  const storage = clickCollection.sessionStorageEnabled
    ? nameSpacedStorage.session
    : transientStorage;
  clickActivityStorage = createClickActivityStorage({ storage });
  const injectClickedElementProperties = createInjectClickedElementProperties({
    config,
    logger,
    clickActivityStorage,
    getClickedElementProperties
  });
  const recallAndInjectClickedElementProperties = createRecallAndInjectClickedElementProperties(
    {
      clickActivityStorage
    }
  );
  const storePageViewProperties = createStorePageViewProperties({
    clickActivityStorage
  });
  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { lifecycle } = tools;
        attachClickActivityCollector({
          eventManager,
          lifecycle,
          handleError
        });
        // TODO: createScrollActivityCollector ...
      },
      onClick({ event, clickedElement }) {
        injectClickedElementProperties({
          event,
          clickedElement
        });
      },
      onBeforeEvent({ event }) {
        if (hasPageName(event)) {
          if (clickCollection.eventGroupingEnabled) {
            recallAndInjectClickedElementProperties(event);
          }
          storePageViewProperties(event, logger, clickActivityStorage);
        }
      }
    }
  };
};

createActivityCollector.namespace = "ActivityCollector";
createActivityCollector.configValidators = configValidators;
createActivityCollector.buildOnInstanceConfiguredExtraParams = ({
  config,
  logger
}) => {
  return {
    getLinkDetails: targetElement => {
      return getClickedElementProperties({
        clickActivityStorage,
        clickedElement: targetElement,
        config,
        logger
      }).properties;
    }
  };
};

export default createActivityCollector;
