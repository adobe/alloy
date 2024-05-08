/*
Copyright 2019 Adobe. Ackll rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { boolean, objectOf, string } from "../../utils/validation/index.js";
import createComponent from "./createComponent.js";
import { initDomActionsModules } from "./dom-actions/index.js";
import createCollect from "./createCollect.js";
import { hideContainers, showContainers } from "./flicker/index.js";
import createFetchDataHandler from "./createFetchDataHandler.js";
import collectClicks from "./dom-actions/clicks/collectClicks.js";
import isAuthoringModeEnabled from "./utils/isAuthoringModeEnabled.js";
import { mergeDecisionsMeta, mergeQuery } from "./event.js";
import createOnClickHandler from "./createOnClickHandler.js";
import createViewCacheManager from "./createViewCacheManager.js";
import createViewChangeHandler from "./createViewChangeHandler.js";
import createClickStorage from "./createClickStorage.js";
import createApplyPropositions from "./createApplyPropositions.js";
import createGetPageLocation from "./createGetPageLocation.js";
import createSetTargetMigration from "./createSetTargetMigration.js";
import remapCustomCodeOffers from "./dom-actions/remapCustomCodeOffers.js";
import remapHeadOffers from "./dom-actions/remapHeadOffers.js";
import createPreprocess from "./dom-actions/createPreprocess.js";
import injectCreateProposition from "./handlers/injectCreateProposition.js";
import createAsyncArray from "./utils/createAsyncArray.js";
import * as schema from "../../constants/schema.js";
import processDefaultContent from "./handlers/processDefaultContent.js";
import { isPageWideSurface } from "./utils/surfaceutils.js";
import createProcessDomAction from "./handlers/createProcessDomAction.js";
import createProcessHtmlContent from "./handlers/createProcessHtmlContent.js";
import createProcessRedirect from "./handlers/createProcessRedirect.js";
import createProcessPropositions from "./handlers/createProcessPropositions.js";
import createOnDecisionHandler from "./createOnDecisionHandler.js";
import createProcessInAppMessage from "./handlers/createProcessInAppMessage.js";
import initInAppMessageActionsModules from "./in-app-message-actions/initInAppMessageActionsModules.js";
import createRedirect from "./dom-actions/createRedirect.js";
import createNotificationHandler from "./createNotificationHandler.js";

const createPersonalization = ({ config, logger, eventManager }) => {
  const { targetMigrationEnabled, prehidingStyle } = config;
  const collect = createCollect({ eventManager, mergeDecisionsMeta });

  const { getClickMetasBySelector, getClickSelectors, storeClickMetrics } =
    createClickStorage();
  const getPageLocation = createGetPageLocation({ window });
  const domActionsModules = initDomActionsModules();

  const preprocess = createPreprocess([remapHeadOffers, remapCustomCodeOffers]);
  const createProposition = injectCreateProposition({
    preprocess,
    isPageWideSurface,
  });
  const viewCache = createViewCacheManager({ createProposition });

  const executeRedirect = createRedirect(window);
  const schemaProcessors = {
    [schema.DEFAULT_CONTENT_ITEM]: processDefaultContent,
    [schema.DOM_ACTION]: createProcessDomAction({
      modules: domActionsModules,
      logger,
      storeClickMetrics,
    }),
    [schema.HTML_CONTENT_ITEM]: createProcessHtmlContent({
      modules: domActionsModules,
      logger,
    }),
    [schema.REDIRECT_ITEM]: createProcessRedirect({
      logger,
      executeRedirect,
      collect,
    }),
    [schema.MESSAGE_IN_APP]: createProcessInAppMessage({
      modules: initInAppMessageActionsModules(collect),
      logger,
    }),
  };

  const processPropositions = createProcessPropositions({
    schemaProcessors,
    logger,
  });

  const renderedPropositions = createAsyncArray();
  const notificationHandler = createNotificationHandler(
    collect,
    renderedPropositions,
  );

  const fetchDataHandler = createFetchDataHandler({
    prehidingStyle,
    showContainers,
    hideContainers,
    mergeQuery,
    processPropositions,
    createProposition,
    notificationHandler,
  });

  const onClickHandler = createOnClickHandler({
    mergeDecisionsMeta,
    collectClicks,
    getClickSelectors,
    getClickMetasBySelector,
  });
  const viewChangeHandler = createViewChangeHandler({
    processPropositions,
    viewCache,
  });
  const applyPropositions = createApplyPropositions({
    processPropositions,
    createProposition,
    renderedPropositions,
    viewCache,
  });
  const setTargetMigration = createSetTargetMigration({
    targetMigrationEnabled,
  });

  const onDecisionHandler = createOnDecisionHandler({
    processPropositions,
    createProposition,
    notificationHandler,
  });

  return createComponent({
    getPageLocation,
    logger,
    fetchDataHandler,
    viewChangeHandler,
    onClickHandler,
    isAuthoringModeEnabled,
    mergeQuery,
    viewCache,
    showContainers,
    applyPropositions,
    setTargetMigration,
    mergeDecisionsMeta,
    renderedPropositions,
    onDecisionHandler,
  });
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = objectOf({
  prehidingStyle: string().nonEmpty(),
  targetMigrationEnabled: boolean().default(false),
});

export default createPersonalization;
