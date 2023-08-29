/* eslint-disable */
import { callback, objectOf, string } from "../../utils/validation";
import { MESSAGE_FEED_ITEM, MESSAGE_IN_APP } from "./constants/schema";
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

    const { data = {} } = item;
    const { content = {}, publishedDate, qualifiedDate, displayedDate } = data;

    return {
      ...content,
      qualifiedDate,
      displayedDate,
      publishedDate,
      getSurface: () => data.meta.surface,
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
            .filter(item => item.schema === MESSAGE_FEED_ITEM)
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
