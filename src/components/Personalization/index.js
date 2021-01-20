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

import { string } from "../../utils/validation/index";
import createComponent from "./createComponent";
import { initDomActionsModules, executeActions } from "./dom-actions/index";
import createCollect from "./createCollect";
import createViewCollect from "./createViewCollect";
import createExecuteDecisions from "./createExecuteDecisions";
import { hideContainers, showContainers } from "./flicker/index";
import createFetchDataHandler from "./createFetchDataHandler";
import collectClicks from "./dom-actions/clicks/collectClicks";
import isAuthoringModeEnabled from "./utils/isAuthoringModeEnabled";
import { mergeMeta, mergeQuery } from "./event";
import createOnClickHandler from "./createOnClickHandler";
import createExecuteCachedViewDecisions from "./createExecuteCachedViewDecisions";
import createViewCacheManager from "./createViewCacheManager";
import createViewChangeHandler from "./createViewChangeHandler";
import decisionsExtractor from "./decisionsExtractor";
import createOnResponseHandler from "./createOnResponseHandler";

const createPersonalization = ({ config, logger, eventManager }) => {
  const collect = createCollect({ eventManager, mergeMeta });
  const viewCollect = createViewCollect({ eventManager, mergeMeta });
  const clickStorage = [];
  const viewCache = createViewCacheManager();
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
  const executeCachedViewDecisions = createExecuteCachedViewDecisions({
    viewCache,
    executeViewDecisions,
    collect: viewCollect
  });
  const responseHandler = createOnResponseHandler({
    decisionsExtractor,
    executeDecisions,
    executeCachedViewDecisions,
    showContainers
  });
  const fetchDataHandler = createFetchDataHandler({
    config,
    responseHandler,
    showContainers,
    hideContainers,
    mergeQuery
  });
  const onClickHandler = createOnClickHandler({
    mergeMeta,
    collectClicks,
    clickStorage
  });
  const viewChangeHandler = createViewChangeHandler({
    executeCachedViewDecisions,
    viewCache,
    showContainers
  });
  return createComponent({
    logger,
    fetchDataHandler,
    viewChangeHandler,
    onClickHandler,
    isAuthoringModeEnabled,
    mergeQuery,
    viewCache
  });
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
