import { initDomActionsModules } from "./turbine";
import { hideContainers, showContainers } from "./flicker";
import collectClicks from "./helper/clicks/collectClicks";
import { includes, noop } from "../../utils";
import {
  executeDecisions,
  filterDecisionsItemsBySchema,
  hasScopes,
  allSchemas,
  PAGE_WIDE_SCOPE,
  getDecisions
} from "./decisionsFactory";

// This is used for Target VEC integration
const isAuthoringMode = () => document.location.href.indexOf("mboxEdit") !== -1;
const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
};

const createCollect = eventManager => {
  return meta => {
    const event = eventManager.createEvent();

    mergeMeta(event, meta);

    eventManager.sendEvent(event);
  };
};

const isPersonalizationDisabled = (renderDecisions, decisionScopes) => {
  return !renderDecisions && !hasScopes(decisionScopes);
};

const createQueryDetails = ({ renderDecisions, decisionScopes }) => {
  const result = {};
  const scopes = [...decisionScopes];

  if (renderDecisions && !includes(scopes, PAGE_WIDE_SCOPE)) {
    scopes.push(PAGE_WIDE_SCOPE);
  }

  if (renderDecisions || hasScopes(scopes)) {
    result.accepts = allSchemas;
    result.decisionScopes = scopes;
  }

  return result;
};

export default ({ config, logger, eventManager }) => {
  const { prehidingStyle } = config;
  const authoringModeEnabled = isAuthoringMode();
  const collect = createCollect(eventManager);
  const storage = [];
  const store = value => storage.push(value);
  const modules = initDomActionsModules(collect, store);

  return {
    lifecycle: {
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        onResponse = noop,
        onRequestFailure = noop
      }) {
        if (isPersonalizationDisabled(renderDecisions, decisionScopes)) {
          return;
        }

        if (authoringModeEnabled) {
          logger.warn("Rendering is disabled, authoring mode.");

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return;
        }

        // For renderDecisions we try to hide the personalization containers
        if (renderDecisions) {
          hideContainers(prehidingStyle);
        }

        mergeQuery(
          event,
          createQueryDetails({ renderDecisions, decisionScopes })
        );

        onResponse(({ response }) => {
          const decisions = getDecisions(response);

          if (renderDecisions) {
            executeDecisions(decisions, renderDecisions, modules, logger);
            showContainers();
            const filteredDecisions = filterDecisionsItemsBySchema(decisions);
            return { decisions: filteredDecisions };
          }

          return { decisions };
        });

        onRequestFailure(() => {
          showContainers();
        });
      },

      onClick({ event, clickedElement }) {
        const merger = meta => mergeMeta(event, meta);

        collectClicks(merger, clickedElement, storage);
      }
    }
  };
};
