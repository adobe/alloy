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

import { string, boolean, objectOf } from "../../utils/validation";
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
import createClickStorage from "./createClickStorage";
import createApplyPropositions from "./createApplyPropositions";
import createGetPageLocation from "./createGetPageLocation";
import createSetTargetMigration from "./createSetTargetMigration";
import propositionHandler from "./handlers/propositionHandler";
import createRedirectHandler from "./handlers/createRedirectHandler";
import createCachingHandler from "./handlers/createCachingHandler";
import createDomActionHandler from "./handlers/createDomActionHandler";
import createMeasurementSchemaHandler from "./handlers/createMeasurementSchemaHandler";
import { isPageWideSurface } from "./utils/surfaceUtils";

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
  const modules = initDomActionsModules(storeClickMetrics);
  const executeDecisions = createExecuteDecisions({
    modules,
    logger,
    executeActions
  });

  const applyPropositions = createApplyPropositions({
    executeDecisions
  });

  const noOpHandler = () => undefined;
  const cachingHandler = createCachingHandler({ next: noOpHandler });
  const domActionHandler = createDomActionHandler({ next: cachingHandler, executeDecisions, isPageWideSurface });
  const measurementSchemaHandler = createMeasurementSchemaHandler({ next: domActionHandler });
  const redirectHandler = createRedirectHandler({ next: measurementSchemaHandler });

  const fetchDataHandler = createFetchDataHandler({
    prehidingStyle,
    propositionHandler,
    hideContainers,
    mergeQuery,
    renderHandler: redirectHandler,
    nonRenderHandler: cachingHandler,
    collect
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

createPersonalization.configValidators = objectOf({
  prehidingStyle: string().nonEmpty(),
  targetMigrationEnabled: boolean().default(false)
});

export default createPersonalization;
