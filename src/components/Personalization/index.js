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

import { boolean, string } from "../../utils/validation";
import createComponent from "./createComponent";
import createCollect from "./createCollect";
import createExecuteDecisions from "./createExecuteDecisions";
import { hideContainers, showContainers } from "./flicker";
import createFetchDataHandler from "./createFetchDataHandler";
import collectClicks from "./dom-actions/clicks/collectClicks";
import isAuthoringModeEnabled from "./utils/isAuthoringModeEnabled";
import { mergeDecisionsMeta, mergeQuery } from "./event";
import createOnClickHandler from "./createOnClickHandler";
import createViewCacheManager from "./createViewCacheManager";
import createViewChangeHandler from "./createViewChangeHandler";
import groupDecisions from "./groupDecisions";
import createOnResponseHandler from "./createOnResponseHandler";
import createClickStorage from "./createClickStorage";
import createRedirectHandler from "./createRedirectHandler";
import createAutorenderingHandler from "./createAutoRenderingHandler";
import createNonRenderingHandler from "./createNonRenderingHandler";
import createApplyPropositions from "./createApplyPropositions";
import createGetPageLocation from "./createGetPageLocation";
import createSetTargetMigration from "./createSetTargetMigration";
import createActionsProvider from "./createActionsProvider";
import executeActions from "./executeActions";
import createModules from "./createModules";
import createPreprocessors from "./createPreprocessors";

const createPersonalization = ({ config, logger, eventManager }) => {
  const { targetMigrationEnabled, prehidingStyle } = config;
  const collect = createCollect({ eventManager, mergeDecisionsMeta });

  const {
    getClickMetasBySelector,
    getClickSelectors,
    storeClickMetrics
  } = createClickStorage();
  const getPageLocation = createGetPageLocation({ window });
  const viewCache = createViewCacheManager();

  const actionsProvider = createActionsProvider({
    modules: createModules({ storeClickMetrics, collect }),
    preprocessors: createPreprocessors(),
    logger
  });

  const executeDecisions = createExecuteDecisions({
    actionsProvider,
    logger,
    executeActions
  });
  const handleRedirectDecisions = createRedirectHandler({
    collect,
    window,
    logger,
    showContainers
  });
  const autoRenderingHandler = createAutorenderingHandler({
    viewCache,
    executeDecisions,
    showContainers,
    collect
  });
  const applyPropositions = createApplyPropositions({
    executeDecisions
  });
  const nonRenderingHandler = createNonRenderingHandler({ viewCache });
  const responseHandler = createOnResponseHandler({
    autoRenderingHandler,
    nonRenderingHandler,
    groupDecisions,
    handleRedirectDecisions,
    showContainers
  });
  const fetchDataHandler = createFetchDataHandler({
    prehidingStyle,
    responseHandler,
    hideContainers,
    mergeQuery
  });
  const onClickHandler = createOnClickHandler({
    mergeDecisionsMeta,
    collectClicks,
    getClickSelectors,
    getClickMetasBySelector
  });
  const viewChangeHandler = createViewChangeHandler({
    mergeDecisionsMeta,
    collect,
    executeDecisions,
    viewCache
  });
  const setTargetMigration = createSetTargetMigration({
    targetMigrationEnabled
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
    setTargetMigration
  });
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty(),
  targetMigrationEnabled: boolean().default(false)
};

export default createPersonalization;
