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

import { callback } from "../../../../../src/utils/validation";
import describeTransformer from "./describeTransformer";

describe("validation::callback", () => {
  describeTransformer("optional callback", callback(), [
    { value: "", error: true },
    { value: "true", error: true },
    { value: [1], error: true },
    { value: {}, error: true },
    { value: 0, error: true },
    { value: () => undefined },
    { value: function func() {} }
  ]);

  describeTransformer("required callback", callback().required(), [
    { value: () => undefined },
    { value: null, error: true },
    { value: undefined, error: true }
  ]);

  const func1 = () => {};
  const func2 = () => {};
  describeTransformer(
    "callback with default value",
    callback().default(func1),
    [
      { value: null, expected: func1 },
      { value: undefined, expected: func1 },
      { value: func2, expected: func2 }
    ]
  );
});
