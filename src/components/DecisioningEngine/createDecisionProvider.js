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

export default ({ eventRegistry }) => {
  const payloads = {};

  const decisionHistory = createDecisionHistory({ eventRegistry });

  const addPayload = payload => {
    if (!payload.id) {
      return;
    }

    const evaluableRulesetPayload = createEvaluableRulesetPayload(
      payload,
      eventRegistry,
      decisionHistory
    );

    if (evaluableRulesetPayload.isEvaluable) {
      payloads[payload.id] = evaluableRulesetPayload;
    }
  };

  const evaluate = async (context = {}) => {
    const consequences = await Promise.all(
      Object.values(payloads).map(payload => payload.evaluate(context))
    );

    return consequences.filter(payload => payload.items.length > 0);
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
