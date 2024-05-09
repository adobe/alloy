/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  mapOfValues,
  arrayOf,
  anything,
  string,
} from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::mapOfValues", () => {
  describeValidation(
    "map of required strings",
    mapOfValues(string().required()).required(),
    [
      { value: {} },
      { value: { a: "1" } },
      { value: { a: "1", b: "2", c: "3" } },
      { value: undefined, error: true },
      { value: null, error: true },
      { value: { a: 123 }, error: true },
      { value: 123, error: true },
      { value: { a: undefined }, error: true },
    ],
  );

  describeValidation("map of arrays", mapOfValues(arrayOf(anything())), [
    { value: { a: [], b: [true, 1, 0.1, "string", undefined, null] } },
    { value: { a: "string" }, error: true },
    { value: { a: undefined }, expected: {} },
    { value: { a: null } },
    { value: undefined },
    { value: null },
  ]);
});
