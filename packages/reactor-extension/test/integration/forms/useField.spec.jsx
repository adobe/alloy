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

import { afterEach, describe, expect, it } from "vitest";
import { memo } from "react";
import PropTypes from "prop-types";
import { Formik, useField as useFormikField } from "formik";
import useField from "../../../src/view/forms/useField";
import { FormStoreProvider } from "../../../src/view/forms/formStore";
import renderView from "../helpers/renderView";

const initialValues = {
  text: "initial",
  checkbox: true,
  tags: ["a"],
  radio: "x",
  nested: { value: "deep" },
};

const configs = [
  "text",
  "nested.value",
  { name: "checkbox", type: "checkbox" },
  { name: "tags", type: "checkbox", value: "a" },
  { name: "radio", type: "radio", value: "x" },
  { name: "tags", as: "select", multiple: true },
];

const withoutFunctions = (object) =>
  JSON.parse(
    JSON.stringify(object, (_, v) => (typeof v === "function" ? "fn" : v)),
  );

const Parity = ({ config }) => {
  const ours = useField(config);
  const formiks = useFormikField(config);
  return (
    <output data-test-id="parity">
      {JSON.stringify(withoutFunctions(ours)) ===
      JSON.stringify(withoutFunctions(formiks))
        ? "match"
        : JSON.stringify([withoutFunctions(ours), withoutFunctions(formiks)])}
    </output>
  );
};

Parity.propTypes = {
  config: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

const renderCounts = {};

const Probe = memo(function Probe({ name }) {
  const [{ value }, , { setValue }] = useField(name);
  renderCounts[name] = (renderCounts[name] ?? 0) + 1;
  return (
    <button type="button" onClick={() => setValue(`${value}!`)}>
      {name}:{String(value)}
    </button>
  );
});

Probe.propTypes = {
  name: PropTypes.string.isRequired,
};

const render = (children) =>
  renderView(() => (
    <Formik
      initialValues={initialValues}
      initialErrors={{ text: "initial error" }}
      initialTouched={{ text: true }}
      onSubmit={() => {}}
    >
      <FormStoreProvider>{children}</FormStoreProvider>
    </Formik>
  ));

describe("useField", () => {
  let view;

  afterEach(() => {
    view?.unmount();
    Object.keys(renderCounts).forEach((key) => delete renderCounts[key]);
  });

  it.each(configs)(
    "returns the same shape as Formik for %o",
    async (config) => {
      view = await render(<Parity config={config} />);

      await expect
        .element(view.getByTestId("parity"))
        .toHaveTextContent(/^match$/);
    },
  );

  it("re-renders only fields whose state changed", async () => {
    view = await render(
      <>
        <Probe name="text" />
        <Probe name="radio" />
      </>,
    );
    const rendersBefore = renderCounts.radio;

    await view.getByRole("button", { name: "text:initial" }).click();

    await expect
      .element(view.getByRole("button", { name: "text:initial!" }))
      .toBeVisible();
    expect(renderCounts.radio).toBe(rendersBefore);
  });

  it("runs field-level validation", async () => {
    const Validated = () => {
      const [, { error }, { setTouched }] = useField({
        name: "text",
        validate: (value) => (value === "initial" ? "invalid" : undefined),
      });
      return (
        <button type="button" onClick={() => setTouched(true)}>
          {error ?? "none"}
        </button>
      );
    };
    view = await render(<Validated />);

    await view.getByRole("button").click();

    await expect.element(view.getByRole("button")).toHaveTextContent("invalid");
  });
});
