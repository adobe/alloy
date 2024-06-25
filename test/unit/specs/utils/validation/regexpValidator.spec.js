/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { string } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::regexp", () => {
  describeValidation("optional regexp", string().regexp(), [
    { value: "steel|bronze" },
    { value: "/a/" },
    { value: "/^[a-z0-9+]:///i" },
    { value: "[", error: true },
    { value: "*", error: true },
    { value: null },
    { value: undefined },
  ]);

  describeValidation("required regexp", string().regexp().required(), [
    { value: null, error: true },
    { value: undefined, error: true },
    { value: "" },
  ]);

  describeValidation("default regexp", string().regexp().default("/default/"), [
    { value: null, expected: "/default/" },
    { value: undefined, expected: "/default/" },
    { value: "a" },
  ]);
});
