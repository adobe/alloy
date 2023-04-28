/* eslint-disable */
import { callback, objectOf, string } from "../../utils/validation";
import { IN_APP_MESSAGE } from "./constants/schema";
import { DISPLAY, INTERACT } from "./constants/eventType";

const validateSubscribeMessageFeedOptions = ({ options }) => {
  const validator = objectOf({
    surface: string().required(),
    callback: callback().required()
  }).noUnknownFields();

  return validator(options);
};

export default ({ collect }) => {
  let subscriptionHandler;
  let surfaceIdentifier;
  const run = ({ surface, callback }) => {
    subscriptionHandler = callback;
    surfaceIdentifier = surface;
  };

  const optionsValidator = options =>
    validateSubscribeMessageFeedOptions({ options });

  const createFeedItem = (payload, item) => {
    const { id, scope, scopeDetails } = payload;

    const { data = {}, qualifiedDate, displayedDate } = item;
    const { content = {} } = data;

    return {
      ...content,
      qualifiedDate,
      displayedDate,
      getSurface: () => item.meta.surface,
      getAnalyticsDetail: () => {
        return { id, scope, scopeDetails };
      }
    };
  };

  const renderedSet = new Set();

  const clicked = (items = []) => {
    const decisionsMeta = [];
    const clickedSet = new Set();

    items.forEach(item => {
      const analyticsMeta = item.getAnalyticsDetail();
      if (!clickedSet.has(analyticsMeta.id)) {
        decisionsMeta.push(analyticsMeta);
        clickedSet.add(analyticsMeta.id);
      }
    });

    if (decisionsMeta.length > 0) {
      collect({ decisionsMeta, eventType: INTERACT, documentMayUnload: true });
    }
  };

  const rendered = (items = []) => {
    const decisionsMeta = [];

    items.forEach(item => {
      const analyticsMeta = item.getAnalyticsDetail();
      if (!renderedSet.has(analyticsMeta.id)) {
        decisionsMeta.push(analyticsMeta);
        renderedSet.add(analyticsMeta.id);
      }
    });

    if (decisionsMeta.length > 0) {
      collect({ decisionsMeta, eventType: DISPLAY });
    }
  };

  const refresh = propositions => {
    if (!subscriptionHandler || !surfaceIdentifier) {
      return;
    }

    const result = propositions
      .filter(payload => payload.scope === surfaceIdentifier)
      .reduce((allItems, payload) => {
        const { items = [] } = payload;

        return [
          ...allItems,
          ...items
            .filter(
              item =>
                item.schema === IN_APP_MESSAGE && item.data.type === "feed"
            )
            .map(item => createFeedItem(payload, item))
        ];
      }, [])
      .sort(
        (a, b) =>
          b.qualifiedDate - a.qualifiedDate || b.publishedDate - a.publishedDate
      );

    subscriptionHandler.call(null, { items: result, clicked, rendered });
  };

  return {
    refresh,
    command: {
      optionsValidator,
      run
    }
  };
};
