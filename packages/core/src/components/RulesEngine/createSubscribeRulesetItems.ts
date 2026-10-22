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
import {
  getEventType,
  PropositionEventType,
} from "../../constants/propositionEventType.js";

import type createCollect from "../../utils/createCollect.js";
import type { Callback } from "../../utils/types.js";
import type { Proposition } from "./types.js";

export interface CreateSubscribeRulesetItemsOptions {
  collect: ReturnType<typeof createCollect>;
}

export interface SubscribeRulesetItemsOptions {
  surfaces?: string[];
  schemas?: string[];
  callback: Callback;
}

interface SubscriptionParams {
  surfacesFilter?: string[];
  schemasFilter?: string[];
}

const validateOptions = ({ options }: { options: unknown }) => {
  const validator = objectOf({
    surfaces: arrayOf(string()).uniqueItems(),
    schemas: arrayOf(string()).uniqueItems(),
    callback: callbackType().required(),
  }).noUnknownFields();

  // The validator above guarantees this shape.
  return validator(options) as SubscribeRulesetItemsOptions;
};

const getAnalyticsDetail = (proposition: Proposition) => {
  const { id, scope, scopeDetails } = proposition;
  return { id, scope, scopeDetails };
};

export default ({ collect }: CreateSubscribeRulesetItemsOptions) => {
  let emitPropositions: (subscriptionId?: number) => void = () => undefined;

  const collectedEventsThisSession = new Set<string>();

  const shouldAlwaysCollect = (propositionEventType: string) =>
    // Widened so `includes` accepts any string.
    (
      [PropositionEventType.INTERACT, PropositionEventType.DISMISS] as string[]
    ).includes(propositionEventType);

  const shouldCollect = (
    propositionEventType: string,
    analyticsMetaId: string,
    collectedEventsThisRequest: Set<string>,
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

  const collectEvent = (
    propositionEventType: string,
    propositions: Proposition[] = [],
  ) => {
    if (!(propositions instanceof Array)) {
      return Promise.resolve();
    }

    // Widened so `includes` accepts any string.
    if (
      !(Object.values(PropositionEventType) as string[]).includes(
        propositionEventType,
      )
    ) {
      return Promise.resolve();
    }

    const decisionsMeta: ReturnType<typeof getAnalyticsDetail>[] = [];

    const collectedEventsThisRequest = new Set<string>();

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

  const emissionPreprocessor = (params: unknown, propositions: unknown) => {
    // run registers every subscription with SubscriptionParams.
    const { surfacesFilter, schemasFilter } = params as SubscriptionParams;

    const result = {
      // refresh emits a proposition list.
      propositions: (propositions as Proposition[])
        .filter((payload) =>
          surfacesFilter ? surfacesFilter.includes(payload.scope) : true,
        )
        .map((payload) => {
          const { items = [] } = payload;
          return {
            ...payload,
            items: items.filter((item) =>
              schemasFilter ? schemasFilter.includes(item.schema) : true,
            ),
          };
        })
        .filter((payload) => payload.items.length > 0),
    };

    return [result, collectEvent];
  };

  subscriptions.setEmissionPreprocessor(emissionPreprocessor);

  const run = ({
    surfaces,
    schemas,
    callback,
  }: SubscribeRulesetItemsOptions) => {
    // The validator requires a callback, so add never returns its no-op.
    const { id, unsubscribe } = subscriptions.add(callback, {
      surfacesFilter: surfaces instanceof Array ? surfaces : undefined,
      schemasFilter: schemas instanceof Array ? schemas : undefined,
    }) as { id: number; unsubscribe: () => void };
    emitPropositions(id);
    return Promise.resolve({ unsubscribe });
  };

  const optionsValidator = (options: unknown) => validateOptions({ options });

  const refresh = (propositions: Proposition[]) => {
    emitPropositions = (subscriptionId?: number) => {
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
