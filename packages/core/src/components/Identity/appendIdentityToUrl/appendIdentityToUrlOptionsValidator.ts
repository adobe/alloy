/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { validateConfigOverride } from "../../../utils/index.js";
import { objectOf, string } from "../../../utils/validation/index.js";
import type {
  ObjectValidator,
  StringValidator,
} from "../../../utils/validation/types.js";
/**
 * Verifies user provided event options.
 * @param options - The user event options to validate
 * @returns Validated options
 */
export default // `required` is typed on the base validator, so it loses the object methods.
(
  objectOf({
    // `required` is typed on the base validator, so it loses the string methods.
    url: (string().required() as StringValidator).nonEmpty(),
    edgeConfigOverrides: validateConfigOverride,
  }).required() as ObjectValidator
).noUnknownFields();
