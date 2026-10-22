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
// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- no import form preserves an ambient .d.ts
/// <reference path="./aepRulesEngine.ts" preserve="true" />
import RulesEngine from "@adobe/aep-rules-engine";
import type { Consequence } from "@adobe/aep-rules-engine";
import { JSON_CONTENT_ITEM, RULESET_ITEM } from "../../constants/schema.js";
import { DISPLAY } from "../../constants/eventType.js";
import { PropositionEventType } from "../../constants/propositionEventType.js";
import { generateEventHash, getActivityId } from "./utils/index.js";

import flattenArray from "../../utils/flattenArray.js";
import createConsequenceAdapter from "./createConsequenceAdapter.js";
import type { EventRegistryApi } from "./createEventRegistry.js";
import type { Proposition, PropositionItem } from "./types.js";

export interface EvaluateOptions {
  recordTrigger?: boolean;
}

export interface EvaluableRulesetPayload {
  rank: number;
  evaluate: (
    context: Record<string, unknown>,
    options?: EvaluateOptions,
  ) => Proposition;
  isEvaluable: boolean;
}

const isRulesetItem = (item: PropositionItem) => {
  const { schema, data } = item;

  if (schema === RULESET_ITEM) {
    return true;
  }

  if (schema !== JSON_CONTENT_ITEM) {
    return false;
  }

  try {
    const content =
      typeof data.content === "string"
        ? JSON.parse(data.content)
        : data.content;

    return (
      content &&
      Object.prototype.hasOwnProperty.call(content, "version") &&
      Object.prototype.hasOwnProperty.call(content, "rules")
    );
  } catch {
    return false;
  }
};

export default (
  payload: Proposition,
  eventRegistry: Pick<EventRegistryApi, "addEvent" | "getEvent">,
): EvaluableRulesetPayload => {
  const consequenceAdapter = createConsequenceAdapter();
  const activityId = getActivityId(payload);
  const items: ReturnType<typeof RulesEngine>[] = [];

  const addItem = (item: PropositionItem) => {
    const { data = {}, schema } = item;

    const content: unknown = schema === RULESET_ITEM ? data : data.content;

    if (!content) {
      return;
    }

    items.push(
      RulesEngine(typeof content === "string" ? JSON.parse(content) : content, {
        generateEventHash,
      }),
    );
  };

  const evaluate = (
    context: Record<string, unknown>,
    { recordTrigger = true }: EvaluateOptions = {},
  ): Proposition => {
    const displayEvent = eventRegistry.getEvent(DISPLAY, activityId);
    const displayedDate = displayEvent?.timestamps[0];

    // flattenArray flattens fully; its FlatArray type cannot resolve the depth.
    const qualifyingItems = (
      flattenArray(items.map((item) => item.execute(context))) as Consequence[]
    )
      .map(consequenceAdapter)
      .map((item) => {
        const event = recordTrigger
          ? eventRegistry.addEvent({
              eventType: PropositionEventType.TRIGGER,
              eventId: activityId,
            })
          : eventRegistry.getEvent(PropositionEventType.TRIGGER, activityId);

        const qualifiedDate = event?.timestamps[0];

        return {
          ...item,
          data: { ...item.data, qualifiedDate, displayedDate },
        };
      });

    return {
      ...payload,
      // Rule consequences carry proposition items; the engine types them loosely.
      items: qualifyingItems as PropositionItem[],
    };
  };

  if (Array.isArray(payload.items)) {
    payload.items.filter(isRulesetItem).forEach(addItem);
  }

  return {
    rank: payload?.scopeDetails?.rank || Infinity,
    evaluate,
    isEvaluable: items.length > 0,
  };
};
