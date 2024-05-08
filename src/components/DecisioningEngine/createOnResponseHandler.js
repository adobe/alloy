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
import { PERSONALIZATION_DECISIONS_HANDLE } from "../../constants/handle.js";
import flattenObject from "../../utils/flattenObject.js";

export default ({
  renderDecisions,
  decisionProvider,
  applyResponse,
  event,
  personalization,
  decisionContext
}) => {
  const context = {
    ...flattenObject(event.getContent()),
    ...decisionContext
  };

  return ({ response }) => {
    decisionProvider.addPayloads(
      response.getPayloadsByType(PERSONALIZATION_DECISIONS_HANDLE)
    );

    // only evaluate events that include a personalization query
    if (!event.hasQuery()) {
      return { propositions: [] };
    }

    const propositions = decisionProvider.evaluate(context);
    return applyResponse({
      renderDecisions,
      propositions,
      event,
      personalization
    });
  };
};
