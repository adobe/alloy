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

describe("validation::string", () => {
  describeValidation("optional string", string(), [
    {
      value: false,
      error: true,
    },
    {
      value: 0,
      error: true,
    },
    {
      value: [],
      error: true,
    },
    {
      value: () => {},
      error: true,
    },
    {
      value: null,
    },
    {
      value: undefined,
    },
  ]);
  describeValidation("required string", string().required(), [
    {
      value: null,
      error: true,
    },
    {
      value: undefined,
      error: true,
    },
    {
      value: "",
    },
    {
      value: "hello",
    },
  ]);
  describeValidation("default string", string().default("default"), [
    {
      value: null,
      expected: "default",
    },
    {
      value: undefined,
      expected: "default",
    },
    {
      value: "hello",
    },
  ]);
});
