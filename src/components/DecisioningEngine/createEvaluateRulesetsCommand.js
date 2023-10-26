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
import { boolean, objectOf } from "../../utils/validation";

const validateOptions = ({ options }) => {
  const validator = objectOf({
    renderDecisions: boolean(),
    personalization: objectOf({
      decisionContext: objectOf({})
    })
  }).noUnknownFields();

  return validator(options);
};

export default ({ contextProvider, decisionProvider }) => {
  const run = ({ renderDecisions, decisionContext, applyResponse }) => {
    return applyResponse({
      renderDecisions,
      propositions: decisionProvider.evaluate(
        contextProvider.getContext(decisionContext)
      )
    });
  };

  const optionsValidator = options => validateOptions({ options });

  return {
    optionsValidator,
    run
  };
};
