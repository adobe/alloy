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

import {
  anyOf,
  boolean,
  literal,
  objectOf,
  string,
} from "../../utils/validation/index";
import createComponent from "./createComponent";
import { initDomActionsModules } from "./dom-actions/index";
import createCollect from "../../utils/createCollect";
import { createHideContainers, createShowContainers } from "./flicker/index";
import createFetchDataHandler from "./createFetchDataHandler";
import collectClicks from "./dom-actions/clicks/collectClicks";
import isAuthoringModeEnabled from "./utils/isAuthoringModeEnabled";
import { mergeDecisionsMeta, mergeQuery } from "../../utils/event";
import createOnClickHandler from "./createOnClickHandler";
import createViewCacheManager from "./createViewCacheManager";
import createViewChangeHandler from "./createViewChangeHandler";
import createClickStorage from "./createClickStorage";
import createInteractionStorage from "./createInteractionStorage";
import createApplyPropositions from "./createApplyPropositions";
import createGetPageLocation from "./createGetPageLocation";
import createSetTargetMigration from "./createSetTargetMigration";
import remapCustomCodeOffers from "./dom-actions/remapCustomCodeOffers";
import remapHeadOffers from "./dom-actions/remapHeadOffers";
import createPreprocess from "./dom-actions/createPreprocess";
import injectCreateProposition from "./handlers/injectCreateProposition";
import createAsyncArray from "./utils/createAsyncArray";
import * as schema from "../../constants/schema";
import processDefaultContent from "./handlers/processDefaultContent";
import { isPageWideSurface } from "./utils/surfaceUtils";
import createProcessDomAction from "./handlers/createProcessDomAction";
import createProcessHtmlContent from "./handlers/createProcessHtmlContent";
import createProcessRedirect from "./handlers/createProcessRedirect";
import createProcessPropositions from "./handlers/createProcessPropositions";
import createOnDecisionHandler from "./createOnDecisionHandler";
import createProcessInAppMessage from "./handlers/createProcessInAppMessage";
import initInAppMessageActionsModules from "./in-app-message-actions/initInAppMessageActionsModules";
import createRedirect from "./dom-actions/createRedirect";
import createNotificationHandler from "./createNotificationHandler";
import createHandleConsentFlicker from "./createHandleConsentFlicker";
import collectInteractions from "./dom-actions/clicks/collectInteractions";
import {
  ALWAYS,
  NEVER,
  PROPOSITION_INTERACTION_TYPES,
} from "../../constants/propositionInteractionType";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../constants/decisionProvider";

const createPersonalization = ({ config, logger, eventManager, consent }) => {
  const {
    targetMigrationEnabled,
    prehidingStyle,
    autoCollectPropositionInteractions,
  } = config;
  const collect = createCollect({ eventManager, mergeDecisionsMeta });

  const showContainers = createShowContainers(logger);
  const hideContainers = createHideContainers(logger);

  const { storeInteractionMeta, getInteractionMetas } =
    createInteractionStorage();

  const { storeClickMeta, getClickSelectors, getClickMetas } =
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
      storeInteractionMeta,
      storeClickMeta,
      autoCollectPropositionInteractions,
    }),
    [schema.HTML_CONTENT_ITEM]: createProcessHtmlContent({
      modules: domActionsModules,
      logger,
      storeInteractionMeta,
      autoCollectPropositionInteractions,
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
    consent,
    logger,
  });

  const onClickHandler = createOnClickHandler({
    mergeDecisionsMeta,
    collectInteractions,
    collectClicks,
    getInteractionMetas,
    getClickMetas,
    getClickSelectors,
    autoCollectPropositionInteractions,
  });

  const viewChangeHandler = createViewChangeHandler({
    processPropositions,
    viewCache,
    logger,
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

  const handleConsentFlicker = createHandleConsentFlicker({
    showContainers,
    consent,
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
    handleConsentFlicker,
  });
};

createPersonalization.namespace = "Personalization";

const interactionConfigOptions = PROPOSITION_INTERACTION_TYPES.map(
  (propositionInteractionType) => literal(propositionInteractionType),
);

createPersonalization.configValidators = objectOf({
  prehidingStyle: string().nonEmpty(),
  targetMigrationEnabled: boolean().default(false),
  autoCollectPropositionInteractions: objectOf({
    [ADOBE_JOURNEY_OPTIMIZER]: anyOf(interactionConfigOptions).default(ALWAYS),
    [ADOBE_TARGET]: anyOf(interactionConfigOptions).default(NEVER),
  })
    .default({
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      [ADOBE_TARGET]: NEVER,
    })
    .noUnknownFields(),
});

export default createPersonalization;
