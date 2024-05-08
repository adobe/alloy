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
import { anything, objectOf, arrayOf, string } from "../../utils/validation/index.js";

export const EMPTY_PROPOSITIONS = { propositions: [] };

export default ({ logger, options }) => {
  const applyPropositionsOptionsValidator = objectOf({
    propositions: arrayOf(objectOf(anything())),
    metadata: objectOf(anything()),
    viewName: string()
  }).required();

  try {
    return applyPropositionsOptionsValidator(options);
  } catch (e) {
    logger.warn(
      "Invalid options for applyPropositions. No propositions will be applied.",
      e
    );
    return EMPTY_PROPOSITIONS;
  }
};
