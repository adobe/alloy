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

import { string } from "../../utils/validation";
import createComponent from "./createComponent";
import { initDomActionsModules, executeActions } from "./dom-actions";
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

const createPersonalization = ({ config, logger, eventManager }) => {
  const collect = createCollect({ eventManager, mergeDecisionsMeta });

  const {
    getClickMetasBySelector,
    getClickSelectors,
    storeClickMetrics
  } = createClickStorage();
  const viewCache = createViewCacheManager();
  const modules = initDomActionsModules(storeClickMetrics);
  const executeDecisions = createExecuteDecisions({
    modules,
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
    executeDecisions,
    showContainers,
    collect
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
    config,
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
  return createComponent({
    logger,
    fetchDataHandler,
    viewChangeHandler,
    onClickHandler,
    isAuthoringModeEnabled,
    mergeQuery,
    viewCache,
    showContainers,
    applyPropositions
  });
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
