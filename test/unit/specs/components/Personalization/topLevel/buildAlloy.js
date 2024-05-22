/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createEvent from "../../../../../../src/core/createEvent";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";
import createComponent from "../../../../../../src/components/Personalization/createComponent";
import createCollect from "../../../../../../src/components/Personalization/createCollect";
import createFetchDataHandler from "../../../../../../src/components/Personalization/createFetchDataHandler";
import collectClicks from "../../../../../../src/components/Personalization/dom-actions/clicks/collectClicks";
import isAuthoringModeEnabled from "../../../../../../src/components/Personalization/utils/isAuthoringModeEnabled";
import {
  mergeDecisionsMeta,
  mergeQuery
} from "../../../../../../src/components/Personalization/event";
import createOnClickHandler from "../../../../../../src/components/Personalization/createOnClickHandler";
import createViewCacheManager from "../../../../../../src/components/Personalization/createViewCacheManager";
import createViewChangeHandler from "../../../../../../src/components/Personalization/createViewChangeHandler";
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import createApplyPropositions from "../../../../../../src/components/Personalization/createApplyPropositions";
import createSetTargetMigration from "../../../../../../src/components/Personalization/createSetTargetMigration";
import { assign, createCallbackAggregator } from "../../../../../../src/utils";
import injectCreateProposition from "../../../../../../src/components/Personalization/handlers/injectCreateProposition";
import createProcessPropositions from "../../../../../../src/components/Personalization/handlers/createProcessPropositions";
import createAsyncArray from "../../../../../../src/components/Personalization/utils/createAsyncArray";
import * as schema from "../../../../../../src/constants/schema";
import createProcessDomAction from "../../../../../../src/components/Personalization/handlers/createProcessDomAction";
import createProcessHtmlContent from "../../../../../../src/components/Personalization/handlers/createProcessHtmlContent";
import createProcessRedirect from "../../../../../../src/components/Personalization/handlers/createProcessRedirect";
import processDefaultContent from "../../../../../../src/components/Personalization/handlers/processDefaultContent";
import { isPageWideSurface } from "../../../../../../src/components/Personalization/utils/surfaceUtils";
import createSubscribeContentCards from "../../../../../../src/components/Personalization/createSubscribeContentCards";
import createOnDecisionHandler from "../../../../../../src/components/Personalization/createOnDecisionHandler";
import createNotificationHandler from "../../../../../../src/components/Personalization/createNotificationHandler";

const createAction = renderFunc => ({ selector, content }) => {
  renderFunc(selector, content);
  if (selector === "#error") {
    return Promise.reject(new Error(`Error while rendering ${content}`));
  }
  return Promise.resolve();
};

const buildComponent = ({
  actions,
  config,
  logger,
  eventManager,
  getPageLocation,
  window,
  hideContainers,
  showContainers
}) => {
  const initDomActionsModulesMocks = () => {
    return {
      setHtml: createAction(actions.setHtml),
      customCode: createAction(actions.prependHtml),
      setText: createAction(actions.setText),
      setAttribute: createAction(actions.setAttributes),
      setImageSource: createAction(actions.swapImage),
      setStyle: createAction(actions.setStyles),
      move: createAction(actions.setStyles),
      resize: createAction(actions.setStyles),
      rearrange: createAction(actions.rearrangeChildren),
      remove: createAction(actions.removeNode),
      insertAfter: createAction(actions.insertHtmlAfter),
      insertBefore: createAction(actions.insertHtmlBefore),
      replaceHtml: createAction(actions.replaceHtml),
      appendHtml: createAction(actions.appendHtml),
      prependHtml: createAction(actions.prependHtml)
    };
  };

  const { targetMigrationEnabled, prehidingStyle } = config;
  const collect = createCollect({ eventManager, mergeDecisionsMeta });

  const {
    getClickMetasBySelector,
    getClickSelectors,
    storeClickMetrics
  } = createClickStorage();

  const preprocess = action => action;
  const createProposition = injectCreateProposition({
    preprocess,
    isPageWideSurface
  });

  const viewCache = createViewCacheManager({ createProposition });
  const modules = initDomActionsModulesMocks();

  const schemaProcessors = {
    [schema.DEFAULT_CONTENT_ITEM]: processDefaultContent,
    [schema.DOM_ACTION]: createProcessDomAction({
      modules,
      logger,
      storeClickMetrics
    }),
    [schema.HTML_CONTENT_ITEM]: createProcessHtmlContent({ modules, logger }),
    [schema.REDIRECT_ITEM]: createProcessRedirect({
      logger,
      executeRedirect: url => window.location.replace(url),
      collect
    })
  };

  const processPropositions = createProcessPropositions({
    schemaProcessors,
    logger
  });

  const renderedPropositions = createAsyncArray();
  const notificationHandler = createNotificationHandler(
    collect,
    renderedPropositions
  );

  const fetchDataHandler = createFetchDataHandler({
    prehidingStyle,
    showContainers,
    hideContainers,
    mergeQuery,
    processPropositions,
    createProposition,
    notificationHandler
  });
  const onClickHandler = createOnClickHandler({
    mergeDecisionsMeta,
    collectClicks,
    getClickSelectors,
    getClickMetasBySelector
  });
  const viewChangeHandler = createViewChangeHandler({
    processPropositions,
    viewCache
  });
  const applyPropositions = createApplyPropositions({
    processPropositions,
    createProposition,
    renderedPropositions,
    viewCache
  });
  const setTargetMigration = createSetTargetMigration({
    targetMigrationEnabled
  });

  const subscribeContentCards = createSubscribeContentCards({
    collect
  });

  const onDecisionHandler = createOnDecisionHandler({
    processPropositions,
    createProposition,
    notificationHandler,
    subscribeContentCards
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
    subscribeContentCards
  });
};

export default mocks => {
  const component = buildComponent(mocks);
  const { response } = mocks;
  return {
    async sendEvent({
      xdm,
      data,
      renderDecisions,
      decisionScopes,
      personalization
    }) {
      const event = createEvent();
      event.setUserXdm(xdm);
      event.setUserData(data);
      const callbacks = createCallbackAggregator();
      await component.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes,
        personalization: personalization || { sendDisplayEvent: true },
        onResponse: callbacks.add
      });
      const results = await callbacks.call({ response });
      const result = assign({}, ...results);
      await flushPromiseChains();
      event.finalize();
      return { event, result };
    },
    applyPropositions(args) {
      return component.commands.applyPropositions.run(args);
    }
  };
};
