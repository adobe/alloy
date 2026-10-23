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

import createEvaluableRulesetPayload from "./createEvaluableRulesetPayload.js";
import { getActivityId } from "./utils/index.js";
import type {
  EvaluableRulesetPayload,
  EvaluateOptions,
} from "./createEvaluableRulesetPayload.js";
import type { EventRegistryApi } from "./createEventRegistry.js";
import type { Proposition } from "./types.js";

export interface CreateDecisionProviderOptions {
  eventRegistry: Pick<EventRegistryApi, "addEvent" | "getEvent">;
}

export interface DecisionProvider {
  addPayload: (payload: Proposition) => void;
  addPayloads: (personalizationPayloads: Proposition[]) => void;
  evaluate: (
    context?: Record<string, unknown>,
    options?: EvaluateOptions,
  ) => Proposition[];
}

export default ({
  eventRegistry,
}: CreateDecisionProviderOptions): DecisionProvider => {
  const payloadsBasedOnActivityId: Record<string, EvaluableRulesetPayload> = {};

  const addPayload = (payload: Proposition) => {
    const activityId = getActivityId(payload);
    if (!activityId) {
      return;
    }

    const evaluableRulesetPayload = createEvaluableRulesetPayload(
      payload,
      eventRegistry,
    );

    if (evaluableRulesetPayload.isEvaluable) {
      payloadsBasedOnActivityId[activityId] = evaluableRulesetPayload;
    }
  };

  const evaluate = (
    context: Record<string, unknown> = {},
    options: EvaluateOptions = {},
  ) => {
    const sortedPayloadsBasedOnActivityId = Object.values(
      payloadsBasedOnActivityId,
    ).sort(({ rank: rankA }, { rank: rankB }) => rankA - rankB);

    return sortedPayloadsBasedOnActivityId
      .map((payload) => payload.evaluate(context, options))
      .filter((payload) => payload.items.length > 0);
  };

  const addPayloads = (personalizationPayloads: Proposition[]) => {
    personalizationPayloads.forEach(addPayload);
  };

  return {
    addPayload,
    addPayloads,
    evaluate,
  };
};
