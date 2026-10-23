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

import { boolean, objectOf } from "../../utils/validation/index.js";

import type { ApplyResponse } from "./createApplyResponse.js";
import type { ContextProvider } from "./createContextProvider.js";
import type { DecisionProvider } from "./createDecisionProvider.js";

export interface CreateEvaluateRulesetsCommandOptions {
  contextProvider: ContextProvider;
  decisionProvider: Pick<DecisionProvider, "evaluate">;
}

export interface EvaluateRulesetsUserOptions {
  renderDecisions?: boolean;
  personalization?: { decisionContext?: Record<string, unknown> };
}

export interface EvaluateRulesetsRunOptions {
  renderDecisions?: boolean;
  decisionContext?: Record<string, unknown>;
  applyResponse: ApplyResponse;
}

const validateOptions = ({ options }: { options: unknown }) => {
  const validator = objectOf({
    renderDecisions: boolean(),
    personalization: objectOf({
      decisionContext: objectOf({}),
    }),
  }).noUnknownFields();

  // The validator above guarantees this shape.
  return validator(options) as EvaluateRulesetsUserOptions;
};

export default ({
  contextProvider,
  decisionProvider,
}: CreateEvaluateRulesetsCommandOptions) => {
  const run = ({
    renderDecisions,
    decisionContext,
    applyResponse,
  }: EvaluateRulesetsRunOptions) => {
    return applyResponse({
      renderDecisions,
      propositions: decisionProvider.evaluate(
        contextProvider.getContext(decisionContext),
      ),
    });
  };

  const optionsValidator = (options: unknown) => validateOptions({ options });

  return {
    optionsValidator,
    run,
  };
};
