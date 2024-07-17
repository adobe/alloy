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
  arrayOf,
  callback as callbackType,
  objectOf,
  string,
} from "../../utils/validation/index.js";
import createSubscription from "../../utils/createSubscription.js";
import { includes } from "../../utils/index.js";
import {
  getEventType,
  PropositionEventType,
} from "../../constants/propositionEventType.js";

const validateOptions = ({ options }) => {
  const validator = objectOf({
    surfaces: arrayOf(string()).uniqueItems(),
    schemas: arrayOf(string()).uniqueItems(),
    callback: callbackType().required(),
  }).noUnknownFields();

  return validator(options);
};

const getAnalyticsDetail = (proposition) => {
  const { id, scope, scopeDetails } = proposition;
  return { id, scope, scopeDetails };
};

export default ({ collect }) => {
  let emitPropositions = () => undefined;

  const collectedEventsThisSession = new Set();

  const shouldAlwaysCollect = (propositionEventType) =>
    includes(
      [PropositionEventType.INTERACT, PropositionEventType.DISMISS],
      propositionEventType,
    );

  const shouldCollect = (
    propositionEventType,
    analyticsMetaId,
    collectedEventsThisRequest,
  ) => {
    const eventId = [propositionEventType, analyticsMetaId].join("-");

    const result =
      !collectedEventsThisRequest.has(eventId) &&
      (shouldAlwaysCollect(propositionEventType) ||
        !collectedEventsThisSession.has(eventId));

    collectedEventsThisRequest.add(eventId);
    collectedEventsThisSession.add(eventId);

    return result;
  };

  const collectEvent = (propositionEventType, propositions = []) => {
    if (!(propositions instanceof Array)) {
      return Promise.resolve();
    }

    if (!includes(Object.values(PropositionEventType), propositionEventType)) {
      return Promise.resolve();
    }

    const decisionsMeta = [];

    const collectedEventsThisRequest = new Set();

    propositions.forEach((proposition) => {
      const analyticsMeta = getAnalyticsDetail(proposition);
      if (
        !shouldCollect(
          propositionEventType,
          analyticsMeta.id,
          collectedEventsThisRequest,
        )
      ) {
        return;
      }

      decisionsMeta.push(analyticsMeta);
    });

    return decisionsMeta.length > 0
      ? collect({
          decisionsMeta,
          eventType: getEventType(propositionEventType),
          documentMayUnload: true,
        })
      : Promise.resolve();
  };

  const subscriptions = createSubscription();

  const emissionPreprocessor = (params, propositions) => {
    const { surfacesFilter, schemasFilter } = params;

    const result = {
      propositions: propositions
        .filter((payload) =>
          surfacesFilter ? includes(surfacesFilter, payload.scope) : true,
        )
        .map((payload) => {
          const { items = [] } = payload;
          return {
            ...payload,
            items: items.filter((item) =>
              schemasFilter ? includes(schemasFilter, item.schema) : true,
            ),
          };
        })
        .filter((payload) => payload.items.length > 0),
    };

    return [result, collectEvent];
  };

  subscriptions.setEmissionPreprocessor(emissionPreprocessor);

  const run = ({ surfaces, schemas, callback }) => {
    const { id, unsubscribe } = subscriptions.add(callback, {
      surfacesFilter: surfaces instanceof Array ? surfaces : undefined,
      schemasFilter: schemas instanceof Array ? schemas : undefined,
    });
    emitPropositions(id);
    return Promise.resolve({ unsubscribe });
  };

  const optionsValidator = (options) => validateOptions({ options });

  const refresh = (propositions) => {
    emitPropositions = (subscriptionId) => {
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
      run,
    },
  };
};
