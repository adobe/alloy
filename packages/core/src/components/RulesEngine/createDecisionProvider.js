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
import { INBOX_ITEM } from "../../constants/schema.js";
import createEvaluableRulesetPayload from "./createEvaluableRulesetPayload.js";
import { getActivityId } from "./utils/index.js";

const hasInboxItem = (payload) =>
  Array.isArray(payload.items) &&
  payload.items.some((item) => item.schema === INBOX_ITEM);

export default ({ eventRegistry }) => {
  const payloadsBasedOnActivityId = {};
  const passthroughPayloads = [];

  const addPayload = (payload) => {
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
    } else if (hasInboxItem(payload)) {
      passthroughPayloads.push(payload);
    }
  };

  const evaluate = (context = {}) => {
    const sortedPayloadsBasedOnActivityId = Object.values(
      payloadsBasedOnActivityId,
    ).sort(({ rank: rankA }, { rank: rankB }) => rankA - rankB);

    const evaluatedPayloads = sortedPayloadsBasedOnActivityId
      .map((payload) => payload.evaluate(context))
      .filter((payload) => payload.items.length > 0);

    return [...evaluatedPayloads, ...passthroughPayloads];
  };

  const addPayloads = (personalizationPayloads) => {
    personalizationPayloads.forEach(addPayload);
  };

  return {
    addPayload,
    addPayloads,
    evaluate,
  };
};
