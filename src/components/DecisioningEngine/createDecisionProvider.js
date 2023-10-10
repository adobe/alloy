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
import createEvaluableRulesetPayload from "./createEvaluableRulesetPayload";
import createDecisionHistory from "./createDecisionHistory";
import { getActivityId } from "./utils";

export default ({ eventRegistry }) => {
  const payloadsByActivityId = {};

  const decisionHistory = createDecisionHistory({ eventRegistry });

  const addPayload = payload => {
    const activityId = getActivityId(payload);
    if (!activityId) {
      return;
    }

    const evaluableRulesetPayload = createEvaluableRulesetPayload(
      payload,
      eventRegistry,
      decisionHistory
    );

    if (evaluableRulesetPayload.isEvaluable) {
      payloadsByActivityId[activityId] = evaluableRulesetPayload;
    }
  };

  const evaluate = (context = {}) => {
    return new Promise(resolve => {
      Promise.all(
        Object.values(payloadsByActivityId).map(payload =>
          payload.evaluate(context)
        )
      ).then(consequences => {
        resolve(consequences.filter(payload => payload.items.length > 0));
      });
    });
  };

  const addPayloads = personalizationPayloads => {
    personalizationPayloads.forEach(addPayload);
  };

  return {
    addPayload,
    addPayloads,
    evaluate
  };
};
