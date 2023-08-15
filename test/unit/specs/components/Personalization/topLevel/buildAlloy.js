import createEvent from "../../../../../../src/core/createEvent";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";
import createComponent from "../../../../../../src/components/Personalization/createComponent";
import createCollect from "../../../../../../src/components/Personalization/createCollect";
import createExecuteDecisions from "../../../../../../src/components/Personalization/createExecuteDecisions";
import createFetchDataHandler from "../../../../../../src/components/Personalization/createFetchDataHandler";
import collectClicks from "../../../../../../src/components/Personalization/dom-actions/clicks/collectClicks";
import isAuthoringModeEnabled from "../../../../../../src/components/Personalization/utils/isAuthoringModeEnabled";
import { mergeDecisionsMeta, mergeQuery } from "../../../../../../src/components/Personalization/event";
import createOnClickHandler from "../../../../../../src/components/Personalization/createOnClickHandler";
import createViewCacheManager from "../../../../../../src/components/Personalization/createViewCacheManager";
import createViewChangeHandler from "../../../../../../src/components/Personalization/createViewChangeHandler";
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import createApplyPropositions from "../../../../../../src/components/Personalization/createApplyPropositions";
import createSetTargetMigration from "../../../../../../src/components/Personalization/createSetTargetMigration";
import { createCallbackAggregator, assign } from "../../../../../../src/utils";
import createPropositionHandler from "../../../../../../src/components/Personalization/handlers/createPropositionHandler";
import createDomActionHandler from "../../../../../../src/components/Personalization/handlers/createDomActionHandler";
import createMeasurementSchemaHandler from "../../../../../../src/components/Personalization/handlers/createMeasurementSchemaHandler";
import createRedirectHandler from "../../../../../../src/components/Personalization/handlers/createRedirectHandler";
import { isPageWideSurface } from "../../../../../../src/components/Personalization/utils/surfaceUtils";

const createAction = renderFunc => ({ selector, prehidingSelector, content, meta }) => {
  renderFunc(selector, content);
  if (selector === "#error") {
    return Promise.resolve({ meta, error: `Error while rendering ${content}` });
  }
  return Promise.resolve({ meta });
};

const createClick = store => ({ selector }, meta) => {
  store({ selector, meta });
  return Promise.resolve();
};

const noop = ({ meta }) => Promise.resolve({ meta });

const buildComponent = ({
  actions,
  config,
  logger,
  eventManager,
  getPageLocation,
  window,
  hideContainers,
  showContainers,
  executeActions
}) => {

  const initDomActionsModulesMocks = store => {
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

  const viewCache = createViewCacheManager();
  const modules = initDomActionsModulesMocks(storeClickMetrics);
  const executeDecisions = createExecuteDecisions({
    modules,
    logger,
    executeActions
  });


  const noOpHandler = () => undefined;
  const domActionHandler = createDomActionHandler({ next: noOpHandler, isPageWideSurface, modules, storeClickMetrics});
  const measurementSchemaHandler = createMeasurementSchemaHandler({ next: domActionHandler });
  const redirectHandler = createRedirectHandler({ next: measurementSchemaHandler });

  const propositionHandler = createPropositionHandler({ window });
  const fetchDataHandler = createFetchDataHandler({
    prehidingStyle,
    propositionHandler,
    hideContainers,
    mergeQuery,
    renderHandler: redirectHandler,
    nonRenderHandler: noOpHandler,
    collect,
    getView: viewCache.getView
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
    renderHandler: redirectHandler,
    nonRenderHandler: noOpHandler,
    propositionHandler,
    viewCache
  });
  const applyPropositions = createApplyPropositions({
    propositionHandler,
    renderHandler: redirectHandler
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

export default (mocks) => {
  const component = buildComponent(mocks);
  const { response } = mocks;
  return {
    async sendEvent({ xdm, data, renderDecisions, decisionScopes, personalization }) {
      const event = createEvent();
      event.setUserXdm(xdm);
      event.setUserData(data);
      const callbacks = createCallbackAggregator();
      await component.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes,
        personalization,
        onResponse: callbacks.add
      });
      const results = await callbacks.call({ response });
      const result = assign({}, ...results);
      await flushPromiseChains();
      event.finalize();
      return { event, result };
    },
    async applyPropositions(args) {
      return await component.commands.applyPropositions.run(args);
    }
  };
}
