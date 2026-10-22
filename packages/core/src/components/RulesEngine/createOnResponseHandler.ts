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

import { PERSONALIZATION_DECISIONS_HANDLE } from "../../constants/decisionProvider.js";
import flattenObject from "../../utils/flattenObject.js";

import type { Event, Response } from "../../core/types.js";
import type { ApplyResponse } from "./createApplyResponse.js";
import type { DecisionProvider } from "./createDecisionProvider.js";
import type { Proposition } from "./types.js";

export interface CreateOnResponseHandlerOptions {
  renderDecisions?: boolean;
  decisionProvider: Pick<DecisionProvider, "addPayloads" | "evaluate">;
  applyResponse: ApplyResponse;
  event: Event;
  personalization?: Record<string, unknown>;
  decisionContext?: Record<string, unknown>;
}

export default ({
  renderDecisions,
  decisionProvider,
  applyResponse,
  event,
  personalization,
  decisionContext,
}: CreateOnResponseHandlerOptions) => {
  const context = {
    ...flattenObject(event.getContent()),
    ...decisionContext,
  };

  return ({ response }: { response: Pick<Response, "getPayloadsByType"> }) => {
    decisionProvider.addPayloads(
      // Personalization decision payloads are propositions.
      response.getPayloadsByType(
        PERSONALIZATION_DECISIONS_HANDLE,
      ) as Proposition[],
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
      personalization,
    });
  };
};
