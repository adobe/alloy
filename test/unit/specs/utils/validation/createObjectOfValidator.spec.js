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

import { objectOf, string } from "../../../../../src/utils/validation/index.js";
import describeValidation from "../../../helpers/describeValidation.js";

describe("validation::objectOf", () => {
  describeValidation(
    "optional object with various values",
    objectOf({
      a: string().required(),
      b: string().default("b default"),
      c: string(),
    }),
    [
      { value: {}, error: true },
      { value: { a: "1" }, expected: { a: "1", b: "b default" } },
      { value: { a: "1", b: "2", c: "3" } },
      { value: undefined },
      { value: null },
      { value: { a: 123 }, error: true },
      { value: 123, error: true },
    ],
  );

  describeValidation(
    "nested object",
    objectOf({
      a: objectOf({
        aa: string().required(),
      }).required(),
    }),
    [
      { value: {}, error: true },
      { value: { a: {} }, error: true },
      { value: { a: { aa: "11" } } },
    ],
  );

  describeValidation(
    "concat",
    objectOf({
      a: string().required(),
    })
      .concat(
        objectOf({
          b: string().default("b default"),
        }),
      )
      .concat(
        objectOf({
          c: string(),
        }),
      ),
    [
      { value: {}, error: true },
      { value: { a: "1" }, expected: { a: "1", b: "b default" } },
      { value: { a: "1", b: "2", c: "3" } },
      { value: undefined },
      { value: null },
      { value: { a: 123 }, error: true },
      { value: 123, error: true },
    ],
  );
});
