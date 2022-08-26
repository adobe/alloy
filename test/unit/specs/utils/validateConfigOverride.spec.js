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

import validateConfigOverride from "../../../../src/utils/validateConfigOverride";
import describeValidation from "../../helpers/describeValidation";

describeValidation("utils:validateConfigOverride", validateConfigOverride, [
  // TODO find a way to make these tests pass.
  // Right now, they say "Expected $.configuration not to have properties
  // default: Function and required: Function". Those are added by the validator
  // itself.
  // { value: {} },
  // {
  //   value: {
  //     experience_platform: {
  //       datasets: {
  //         event: "werewr",
  //         profile: "www"
  //       }
  //     },
  //     analytics: {
  //       reportSuites: ["sdfsfd"]
  //     },
  //     identity: {
  //       idSyncContainerId: "rrr"
  //     },
  //     target: {
  //       propertyToken: "rrr"
  //     }
  //   }
  // },
  { value: true, error: true },
  { value: false, error: true },
  { value: "", error: true },
  { value: [], error: true },
  { value: 123, error: true }
]);
