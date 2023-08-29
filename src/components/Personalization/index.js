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
import { initDomActionsModules } from "./dom-actions";
import createCollect from "./createCollect";
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
import createRedirectHandler from "./handlers/createRedirectHandler";
import createHtmlContentHandler from "./handlers/createHtmlContentHandler";
import createDomActionHandler from "./handlers/createDomActionHandler";
import createMeasurementSchemaHandler from "./handlers/createMeasurementSchemaHandler";
import createRender from "./handlers/createRender";
import remapCustomCodeOffers from "./dom-actions/remapCustomCodeOffers";
import remapHeadOffers from "./dom-actions/remapHeadOffers";
import createPreprocess from "./dom-actions/createPreprocess";
import { createProposition } from "./handlers/proposition";
import createAsyncArray from "./utils/createAsyncArray";
import createPendingNotificationsHandler from "./createPendingNotificationsHandler";

const createPersonalization = ({ config, logger, eventManager }) => {
  const { targetMigrationEnabled, prehidingStyle } = config;
  const collect = createCollect({ eventManager, mergeDecisionsMeta });

  const {
    getClickMetasBySelector,
    getClickSelectors,
    storeClickMetrics
  } = createClickStorage();
  const getPageLocation = createGetPageLocation({ window });
  const viewCache = createViewCacheManager({ createProposition });
  const modules = initDomActionsModules();

  const preprocess = createPreprocess([remapHeadOffers, remapCustomCodeOffers]);

  const noOpHandler = () => undefined;
  const domActionHandler = createDomActionHandler({
    next: noOpHandler,
    modules,
    storeClickMetrics,
    preprocess
  });
  const measurementSchemaHandler = createMeasurementSchemaHandler({
    next: domActionHandler
  });
  const redirectHandler = createRedirectHandler({
    next: measurementSchemaHandler
  });
  const htmlContentHandler = createHtmlContentHandler({
    next: redirectHandler,
    modules,
    preprocess
  });

  const render = createRender({
    handleChain: htmlContentHandler,
    collect,
    executeRedirect: url => window.location.replace(url),
    logger
  });
  const pendingDisplayNotifications = createAsyncArray();
  const pendingNotificationsHandler = createPendingNotificationsHandler({
    pendingDisplayNotifications,
    mergeDecisionsMeta
  });
  const fetchDataHandler = createFetchDataHandler({
    prehidingStyle,
    hideContainers,
    mergeQuery,
    collect,
    render,
    pendingDisplayNotifications
  });
  const onClickHandler = createOnClickHandler({
    mergeDecisionsMeta,
    collectClicks,
    getClickSelectors,
    getClickMetasBySelector
  });
  const viewChangeHandler = createViewChangeHandler({
    mergeDecisionsMeta,
    render,
    viewCache
  });
  const applyPropositions = createApplyPropositions({
    render
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
    setTargetMigration,
    pendingNotificationsHandler
  });
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = objectOf({
  prehidingStyle: string().nonEmpty(),
  targetMigrationEnabled: boolean().default(false)
});

export default createPersonalization;
