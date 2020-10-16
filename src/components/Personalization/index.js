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
import createViewCollect from "./createViewCollect";
import extractRenderableDecisions from "./extractRenderableDecisions";
import createExecuteDecisions from "./createExecuteDecisions";
import { hideContainers, showContainers } from "./flicker";
import createOnResponseHandler from "./createOnResponseHandler";
import collectClicks from "./dom-actions/clicks/collectClicks";
import { isAuthoringModeEnabled, getDecisionScopes } from "./utils";
import { mergeMeta, mergeQuery, createQueryDetails } from "./event";
import createOnClickHandler from "./createOnClickHandler";
import extractPageWideScopeDecisions from "./extractPageWideScopeDecisions";
import createViewChangeHandler from "./createViewChangeHandler";
import createCacheManager from "./createCacheManager";

const createPersonalization = ({ config, logger, eventManager }) => {
  const collect = createCollect({ eventManager, mergeMeta });
  const viewCollect = createViewCollect({ eventManager, mergeMeta });
  const clickStorage = [];
  const viewStore = createCacheManager();
  const store = value => clickStorage.push(value);
  const modules = initDomActionsModules(store);
  const executeDecisions = createExecuteDecisions({
    modules,
    logger,
    executeActions,
    collect
  });
  const executeViewDecisions = createExecuteDecisions({
    modules,
    logger,
    executeActions,
    collect: viewCollect
  });
  const onViewChangeHandler = createViewChangeHandler({
    viewStore,
    executeViewDecisions,
    collect: viewCollect
  });
  const onResponseHandler = createOnResponseHandler({
    viewStore,
    extractRenderableDecisions,
    extractPageWideScopeDecisions,
    executeDecisions,
    onViewChangeHandler,
    showContainers
  });
  const onClickHandler = createOnClickHandler({
    mergeMeta,
    collectClicks,
    clickStorage
  });
  return createComponent({
    config,
    logger,
    eventManager,
    onResponseHandler,
    onViewChangeHandler,
    onClickHandler,
    hideContainers,
    showContainers,
    isAuthoringModeEnabled,
    getDecisionScopes,
    mergeMeta,
    mergeQuery,
    createQueryDetails,
    viewStore
  });
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
