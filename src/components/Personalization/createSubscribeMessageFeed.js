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
import {
  callback as callbackType,
  objectOf,
  string
} from "../../utils/validation";
import { MESSAGE_FEED_ITEM } from "../../constants/schema";
import { DISMISS, DISPLAY, INTERACT } from "../../constants/eventType";
import createSubscription from "../../utils/createSubscription";

const validateOptions = ({ options }) => {
  const validator = objectOf({
    surface: string().required(),
    callback: callbackType().required()
  }).noUnknownFields();

  return validator(options);
};

export default ({ collect }) => {
  const renderedSet = new Set();

  const createFeedItem = (payload, item) => {
    const { id, scope, scopeDetails } = payload;

    const { data = {} } = item;
    const {
      content = {},
      meta = {},
      publishedDate,
      qualifiedDate,
      displayedDate
    } = data;

    return {
      ...content,
      meta,
      qualifiedDate,
      displayedDate,
      publishedDate,
      getSurface: () => data.meta.surface,
      getAnalyticsDetail: () => {
        return { id, scope, scopeDetails };
      }
    };
  };

  const clicked = (items = []) => {
    if (!(items instanceof Array)) {
      return;
    }

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

  const dismissed = (items = []) => {
    if (!(items instanceof Array)) {
      return Promise.resolve();
    }

    const decisionsMeta = [];
    const dismissedSet = new Set();

    items.forEach(item => {
      const analyticsMeta = item.getAnalyticsDetail();
      if (!dismissedSet.has(analyticsMeta.id)) {
        decisionsMeta.push(analyticsMeta);
        dismissedSet.add(analyticsMeta.id);
      }
    });

    return decisionsMeta.length > 0
      ? collect({ decisionsMeta, eventType: DISMISS, documentMayUnload: true })
      : Promise.resolve();
  };

  const rendered = (items = []) => {
    if (!(items instanceof Array)) {
      return;
    }

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

  let emitPropositions = () => undefined;

  const subscriptions = createSubscription();
  subscriptions.setEmissionPreprocessor((params, propositions) => {
    const { surfaceIdentifier } = params;

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

    return [{ items: result, clicked, rendered, dismissed }];
  });

  const run = ({ surface, callback }) => {
    const { id, unsubscribe } = subscriptions.add(callback, {
      surfaceIdentifier: surface
    });
    emitPropositions(id);
    return Promise.resolve({ unsubscribe });
  };

  const optionsValidator = options => validateOptions({ options });

  const refresh = propositions => {
    emitPropositions = subscriptionId => {
      if (subscriptionId) {
        subscriptions.emitOne(subscriptionId, propositions);
        return;
      }

      subscriptions.emit(propositions);
    };

    emitPropositions();
  };

  return {
    refresh,
    command: {
      optionsValidator,
      run
    }
  };
};
