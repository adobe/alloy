/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import { type } from "arktype";
import {
  all,
  getErrors,
  invalid,
  matches,
  parentOf,
  required,
  rule,
  shape,
  when,
} from "../../../../src/view/forms/validation";

describe("validation", () => {
  it("returns no errors for valid values", () => {
    const schema = shape({ name: required("Please provide a name.") });
    expect(getErrors(schema, { name: "alloy" })).toEqual({});
  });

  it("keys errors by dot-delimited field path", () => {
    const schema = shape({
      instances: shape({ name: required("Please provide a name.") }).array(),
    });
    expect(
      getErrors(schema, { instances: [{ name: "alloy" }, { name: "" }] }),
    ).toEqual({ "instances.1.name": "Please provide a name." });
  });

  it("treats empty values as passing rules other than required", () => {
    const schema = shape({ id: matches(/^\d+$/, "Digits only.") });
    expect(getErrors(schema, { id: "" })).toEqual({});
    expect(getErrors(schema, { id: undefined })).toEqual({});
    expect(getErrors(schema, { id: "a" })).toEqual({ id: "Digits only." });
  });

  it("skips fields that are not in the values", () => {
    const schema = shape({ name: required("Please provide a name.") });
    expect(getErrors(schema, {})).toEqual({});
  });

  it("reports only the first failing rule of a field", () => {
    const schema = shape({
      id: all(required("Required."), matches(/^\d+$/, "Digits only.")),
    });
    expect(getErrors(schema, { id: "" })).toEqual({ id: "Required." });
    expect(getErrors(schema, { id: "a" })).toEqual({ id: "Digits only." });
  });

  it("reports errors from every field, including sibling-dependent rules", () => {
    const channel = rule(
      (value, ctx) => !parentOf(ctx).playerName || value !== "",
      "Please provide a channel.",
    );
    const schema = shape({ name: required("Please provide a name."), channel });
    expect(
      getErrors(schema, { name: "", channel: "", playerName: "p" }),
    ).toEqual({
      name: "Please provide a name.",
      channel: "Please provide a channel.",
    });
  });

  it("applies a schema only when its condition holds, keeping the root", () => {
    const dataElement = rule(
      (value, ctx) => parentOf(ctx).method !== "dataElement" || value !== "",
      "Please provide a data element.",
    );
    const schema = shape({
      push: when(
        (value, ctx) => ctx.root.components.push,
        shape({ dataElement }),
      ),
    });
    const values = { push: { method: "dataElement", dataElement: "" } };
    expect(
      getErrors(schema, { ...values, components: { push: true } }),
    ).toEqual({ "push.dataElement": "Please provide a data element." });
    expect(
      getErrors(schema, { ...values, components: { push: false } }),
    ).toEqual({});
  });

  it("applies the otherwise schema when the condition does not hold", () => {
    const schema = shape({
      name: when(
        (value, ctx) => parentOf(ctx).strict,
        required("Required when strict."),
        matches(/^a/, "Must start with a."),
      ),
    });
    expect(getErrors(schema, { strict: true, name: "" })).toEqual({
      name: "Required when strict.",
    });
    expect(getErrors(schema, { strict: false, name: "b" })).toEqual({
      name: "Must start with a.",
    });
  });

  it("supports ArkType's own constraints with custom messages", () => {
    const schema = shape({
      interval: type("number >= 1").configure({ message: "At least 1." }),
    });
    expect(getErrors(schema, { interval: 0 })).toEqual({
      interval: "At least 1.",
    });
  });

  it("fails an invalid field even when it has no value", () => {
    const schema = shape({ requiredComponent: invalid("Disabled.") });
    expect(Object.keys(getErrors(schema, {}))).toEqual(["requiredComponent"]);
    expect(getErrors(schema, { requiredComponent: true })).toEqual({
      requiredComponent: "Disabled.",
    });
  });
});
