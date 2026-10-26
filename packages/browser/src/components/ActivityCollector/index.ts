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
import { injectStorage } from "@adobe/alloy-core/utils";
import type {
  ComponentCreator,
  ComponentTools,
  Event,
} from "@adobe/alloy-core/core/types.js";
import type {
  ActivityCollectorConfig,
  ClickActivityStorage,
  ClickStorage,
} from "./types.js";

type ActivityCollectorOptions = Pick<
  ComponentTools,
  "config" | "eventManager" | "handleError" | "logger"
>;

const getClickedElementProperties = createGetClickedElementProperties({
  window,
  getLinkName,
  getLinkRegion,
  getAbsoluteUrlFromAnchorElement,
  findClickableElement,
  determineLinkType,
});

let sharedClickActivityStorage: ClickActivityStorage | undefined;
const initClickActivityStorage = (config: ActivityCollectorConfig) => {
  if (!sharedClickActivityStorage) {
    const createNamespacedStorage = injectStorage(window);
    const nameSpacedStorage = createNamespacedStorage(config.orgId || "");
    // Use transient in-memory if sessionStorage is disabled
    const transientStorage = createTransientStorage();
    // The namespaced storage has no removeItem, which only `remove()` uses and
    // nothing calls outside tests.
    const storage: ClickStorage = config.clickCollection.sessionStorageEnabled
      ? (nameSpacedStorage.session as unknown as ClickStorage)
      : transientStorage;
    sharedClickActivityStorage = createClickActivityStorage({ storage });
  }
  return sharedClickActivityStorage;
};

const createActivityCollector: ComponentCreator<ActivityCollectorOptions> = ({
  config: baseConfig,
  eventManager,
  handleError,
  logger,
}) => {
  // configValidators adds the click collection options to the computed config.
  const config = baseConfig as ActivityCollectorConfig;
  validateClickCollectionConfig(config, logger);

  const clickCollection = config.clickCollection;
  const clickActivityStorage = initClickActivityStorage(config);

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
      onComponentsRegistered(tools: Pick<ComponentTools, "lifecycle">) {
        const { lifecycle } = tools;
        attachClickActivityCollector({
          eventManager,
          lifecycle,
          handleError,
        });
        // TODO: createScrollActivityCollector ...
      },
      onClick({
        event,
        clickedElement,
      }: {
        event: Event;
        clickedElement: Node | null;
      }) {
        injectClickedElementProperties({
          event,
          clickedElement,
        });
      },
      onBeforeEvent({ event }: { event: Event }) {
        if (hasPageName(event)) {
          if (clickCollection.eventGroupingEnabled) {
            recallAndInjectClickedElementProperties(event);
          }
          storePageViewProperties(event);
        }
      },
    },
  };
};

createActivityCollector.namespace = "ActivityCollector";
createActivityCollector.configValidators = configValidators;
createActivityCollector.buildOnInstanceConfiguredExtraParams = ({
  config: baseConfig,
  logger,
}) => {
  // The computed config includes the options added by configValidators.
  const config = baseConfig as ActivityCollectorConfig;
  const clickActivityStorage = initClickActivityStorage(config);
  return {
    getLinkDetails: (targetElement: Node) => {
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
