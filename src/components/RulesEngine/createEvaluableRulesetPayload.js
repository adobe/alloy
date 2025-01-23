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
import RulesEngine from "@adobe/aep-rules-engine";
import { JSON_CONTENT_ITEM, RULESET_ITEM } from "../../constants/schema.js";
import { DISPLAY } from "../../constants/eventType.js";
import { getActivityId } from "./utils.js";

import flattenArray from "../../utils/flattenArray.js";
import createConsequenceAdapter from "./createConsequenceAdapter.js";

const isRulesetItem = (item) => {
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

export default (payload, eventRegistry, decisionHistory) => {
  const consequenceAdapter = createConsequenceAdapter();
  const activityId = getActivityId(payload);
  const items = [];

  const addItem = (item) => {
    const { data = {}, schema } = item;

    const content = schema === RULESET_ITEM ? data : data.content;

    if (!content) {
      return;
    }

    items.push(
      RulesEngine(typeof content === "string" ? JSON.parse(content) : content),
    );
  };

  const evaluate = (context) => {
    const displayEvent = eventRegistry.getEvent(DISPLAY, activityId);

    const displayedDate = displayEvent
      ? displayEvent.firstTimestamp
      : undefined;

    const qualifyingItems = flattenArray(
      items.map((item) => item.execute(context)),
    )
      .map(consequenceAdapter)
      .map((item) => {
        const { firstTimestamp: qualifiedDate } =
          decisionHistory.recordQualified(activityId) || {};

        return {
          ...item,
          data: { ...item.data, qualifiedDate, displayedDate },
        };
      });

    return {
      ...payload,
      items: qualifyingItems,
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
