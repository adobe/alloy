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

import { boolean } from "../../../../../src/utils/schema";
import describeTransformer from "./describeTransformer";

describe("schema::boolean", () => {
  describeTransformer("optional boolean", boolean(), [
    { value: "", error: true },
    { value: "true", error: true },
    { value: [1], error: true },
    { value: {}, error: true },
    { value: 0, error: true },
    { value: 42, error: true },
    { value: true },
    { value: false },
    { value: null },
    { value: undefined }
  ]);

  describeTransformer("required boolean", boolean().required(), [
    { value: true },
    { value: false },
    { value: null, error: true },
    { value: undefined, error: true }
  ]);

  describeTransformer("default true boolean", boolean().default(true), [
    { value: null, expected: true },
    { value: undefined, expected: true },
    { value: true },
    { value: false }
  ]);
});
