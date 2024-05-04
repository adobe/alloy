/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  objectOf,
  callback,
  string,
  boolean
} from "../../../../../src/utils/validation";
import describeValidation from "../../../helpers/describeValidation";

describe("validation::deprecated", () => {
  describeValidation(
    "works for a string field",
    objectOf({
      old: string().deprecated(),
      new: string()
    }),
    [
      { value: { old: "a" }, expected: { old: "a" }, warning: true },
      { value: {}, expected: {}, warning: false },
      { value: { new: "b" }, expected: { new: "b" }, warning: false }
    ]
  );

  describeValidation(
    "works for a boolean field",
    objectOf({
      old: boolean().deprecated(),
      new: boolean()
    }),
    [
      { value: { old: true }, expected: { old: true }, warning: true },
      { value: {}, expected: {}, warning: false },
      { value: { new: false }, expected: { new: false }, warning: false }
    ]
  );

  const noop = () => undefined;
  describeValidation(
    "works for a callback field",
    objectOf({
      old: callback().deprecated(),
      new: callback()
    }),
    [
      {
        value: { old: noop, new: noop },
        expected: { old: noop, new: noop },
        warning: true
      },
      { value: {}, expected: {}, warning: false },
      { value: { new: noop }, expected: { new: noop }, warning: false }
    ]
  );
});
