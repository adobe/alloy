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

import { describe } from "vitest";
import { string } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::domain", () => {
  describeValidation("domain", string().domain(), [
    {
      value: "stats.adobe.com",
    },
    {
      value: "stats-edge.adobe.com",
    },
    {
      value: "https://stats.adobe.com",
      error: true,
    },
    {
      value: "stats.adobe.com\n",
      error: true,
    },
    {
      value: "stats.adobe.com\nbad",
      error: true,
    },
  ]);
});
