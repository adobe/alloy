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
import { userEvent } from "vitest/browser";
import IdentityMapView from "../../../src/view/dataElements/identityMapView";
import useView from "../helpers/useView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  identityNamespacesEmptyHandlers,
  identityNamespacesErrorHandlers,
  identityNamespacesMultipleHandlers,
} from "../helpers/mocks/sandboxesAndSchemas/identityNamespaces";

const extensionSettings = {
  instances: [{ name: "alloy1", edgeConfigId: "PR123" }],
};

const identifier = (id, authenticatedState, primary = false) => ({
  id,
  authenticatedState,
  primary,
});

describe("Identity map data element", () => {
  let view;
  let driver;
  let cleanup;

  const init = async (handlers, settings) => {
    worker.use(...handlers);
    ({ view, driver, cleanup } = await useView(IdentityMapView));
    await driver.init({ extensionSettings, settings });
  };

  const tab = (index) => view.getByRole("tab").nth(index);

  const expectTabLabels = (labels) =>
    expect
      .poll(() =>
        view
          .getByRole("tab")
          .elements()
          .map((element) => element.textContent.trim()),
      )
      .toEqual(labels);

  const idField = (identity, index) =>
    field(view.getByTestId(`identity${identity}idField${index}`));
  const stateField = (identity, index) =>
    field(
      view.getByTestId(`identity${identity}authenticatedStateField${index}`),
    );
  const primaryField = (identity, index) =>
    field(view.getByTestId(`identity${identity}primaryField${index}`));
  const namespaceField = (identity) =>
    field(view.getByTestId(`namespace${identity}Field`));

  afterEach(() => cleanup());

  it("initializes identity map with default settings", async () => {
    await init(identityNamespacesEmptyHandlers);
    await namespaceField(0).expectValue("");
    await idField(0, 0).expectValue("");
    await stateField(0, 0).expectValue("Ambiguous");
    await primaryField(0, 0).expectUnchecked();
    await expect
      .element(view.getByTestId("deleteIdentifier0Button0"))
      .not.toBeInTheDocument();
    await expect
      .element(view.getByTestId("deleteIdentity0Button"))
      .not.toBeInTheDocument();
    await expectTabLabels(["Unnamed identity"]);
  });

  it("initializes identity map with sorted namespaces", async () => {
    const settings = {
      S_CUSTOM_IDENTITY: [
        identifier("test1", "loggedOut"),
        identifier("test2", "ambiguous", true),
      ],
      W_CUSTOM_IDENTITY2: [identifier("test3", "authenticated")],
      B_CUSTOM_IDENTITY2: [identifier("test3", "authenticated")],
    };
    await init(identityNamespacesEmptyHandlers, settings);

    await expectTabLabels([
      "B_CUSTOM_IDENTITY2",
      "S_CUSTOM_IDENTITY",
      "W_CUSTOM_IDENTITY2",
    ]);

    await tab(0).click();
    await namespaceField(0).expectValue("B_CUSTOM_IDENTITY2");
    await idField(0, 0).expectValue("test3");
    await stateField(0, 0).expectValue("Authenticated");
    await primaryField(0, 0).expectUnchecked();
    await expect
      .element(view.getByTestId("deleteIdentifier0Button0"))
      .not.toBeInTheDocument();
    await field(view.getByTestId("deleteIdentity0Button")).expectEnabled();

    await tab(1).click();
    await namespaceField(1).expectValue("S_CUSTOM_IDENTITY");
    await idField(1, 0).expectValue("test1");
    await stateField(1, 0).expectValue("Logged Out");
    await primaryField(1, 0).expectUnchecked();
    await field(view.getByTestId("deleteIdentifier1Button0")).expectVisible();
    await idField(1, 1).expectValue("test2");
    await stateField(1, 1).expectValue("Ambiguous");
    await primaryField(1, 1).expectChecked();
    await field(view.getByTestId("deleteIdentifier1Button1")).expectVisible();
    await field(view.getByTestId("deleteIdentity1Button")).expectVisible();

    await tab(2).click();
    await namespaceField(2).expectValue("W_CUSTOM_IDENTITY2");
    await idField(2, 0).expectValue("test3");
    await stateField(2, 0).expectValue("Authenticated");
    await primaryField(2, 0).expectUnchecked();
    await expect
      .element(view.getByTestId("deleteIdentifier2Button0"))
      .not.toBeInTheDocument();
    await field(view.getByTestId("deleteIdentity2Button")).expectVisible();

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      B_CUSTOM_IDENTITY2: [identifier("test3", "authenticated")],
      S_CUSTOM_IDENTITY: [
        identifier("test1", "loggedOut"),
        identifier("test2", "ambiguous", true),
      ],
      W_CUSTOM_IDENTITY2: [identifier("test3", "authenticated")],
    });
  });

  it("adds a new identity and new identifier with minimal settings", async () => {
    await init(identityNamespacesEmptyHandlers, {
      CUSTOM_IDENTITY: [identifier("test1", "loggedOut")],
    });
    await namespaceField(0).expectValue("CUSTOM_IDENTITY");
    await idField(0, 0).expectValue("test1");
    await stateField(0, 0).expectValue("Logged Out");
    await primaryField(0, 0).expectUnchecked();
    await expect
      .element(view.getByTestId("deleteIdentifier0Button0"))
      .not.toBeInTheDocument();

    await view.getByTestId("addIdentifier0Button").click();
    await idField(0, 1).fill("test2");
    await stateField(0, 1).selectOption("Ambiguous");
    await primaryField(0, 1).check();

    await view.getByTestId("addIdentityButton").click();
    await namespaceField(1).fill("CUSTOM_IDENTITY2");
    await idField(1, 0).fill("test3");
    await stateField(1, 0).selectOption("Authenticated");

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      CUSTOM_IDENTITY: [
        identifier("test1", "loggedOut"),
        identifier("test2", "ambiguous", true),
      ],
      CUSTOM_IDENTITY2: [identifier("test3", "authenticated")],
    });
  });

  it("removing identifier returns the correct settings", async () => {
    await init(identityNamespacesEmptyHandlers, {
      CUSTOM_IDENTITY: [identifier("test1", "loggedOut")],
      CUSTOM_IDENTITY2: [
        identifier("test3", "authenticated"),
        identifier("test2", "ambiguous", true),
      ],
    });
    await tab(1).click();
    await view.getByTestId("deleteIdentifier1Button1").click();

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      CUSTOM_IDENTITY: [identifier("test1", "loggedOut")],
      CUSTOM_IDENTITY2: [identifier("test3", "authenticated")],
    });
  });

  it("shows error for identity without a namespace", async () => {
    await init(identityNamespacesEmptyHandlers);
    await idField(0, 0).fill("test3");
    await stateField(0, 0).selectOption("Authenticated");

    await driver.expectValidate().toBe(false);
    await namespaceField(0).expectError("Please select a namespace.");
  });

  it("shows error for identifier without an ID", async () => {
    await init(identityNamespacesEmptyHandlers);
    await namespaceField(0).fill("CUSTOM_IDENTITY");
    await stateField(0, 0).selectOption("Authenticated");

    await driver.expectValidate().toBe(false);
    await idField(0, 0).expectError("Please specify an ID.");
  });

  it("selects the tab containing a duplicate namespace error when validating", async () => {
    await init(identityNamespacesEmptyHandlers, {
      CUSTOM_IDENTITY: [identifier("foo", "")],
    });
    await view.getByTestId("addIdentityButton").click();
    await namespaceField(1).fill("CUSTOM_IDENTITY");
    await idField(1, 0).fill("test3");
    await stateField(1, 0).selectOption("Authenticated");

    await tab(0).click();
    await idField(0, 0).expectValue("foo");
    await expect.element(tab(0)).toHaveAttribute("aria-selected", "true");

    await driver.expectValidate().toBe(false);
    await expect.element(tab(1)).toHaveAttribute("aria-selected", "true");
    await namespaceField(1).expectError("Please provide a unique namespace.");
  });

  it("selects the tab containing a second primary identifier error when validating", async () => {
    await init(identityNamespacesEmptyHandlers, {
      CUSTOM_IDENTITY: [identifier("123", "authenticated", true)],
    });
    await view.getByTestId("addIdentityButton").click();
    await namespaceField(1).fill("CUSTOM_IDENTITY2");
    await idField(1, 0).fill("test3");
    await stateField(1, 0).selectOption("Authenticated");
    await primaryField(1, 0).check();

    await tab(0).click();
    await idField(0, 0).expectValue("123");

    await driver.expectValidate().toBe(false);
    await expect.element(tab(1)).toHaveAttribute("aria-selected", "true");
    await expect
      .element(view.getByText("Only one identifier can be primary."))
      .toBeVisible();
  });

  it("initializes namespaces as picker with namespace names", async () => {
    await init(identityNamespacesMultipleHandlers);
    const namespace = field(view.getByTestId("namespace0Combobox"));
    await view
      .getByTestId("namespace0Combobox")
      .getByRole("combobox")
      .fill("AAID");
    await userEvent.keyboard("{Enter}");
    await namespace.expectValue("AAID");
    await idField(0, 0).fill("test3");
    await expectTabLabels(["Adobe Analytics"]);

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ AAID: [identifier("test3", "ambiguous")] });
  });

  it("instantiates the form with a text field when the namespaces call fails", async () => {
    await init(identityNamespacesErrorHandlers);
    await namespaceField(0).expectValue("");
    await namespaceField(0).fill("CUSTOM_IDENTITY");
    await idField(0, 0).fill("test3");
    await expectTabLabels(["CUSTOM_IDENTITY"]);

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ CUSTOM_IDENTITY: [identifier("test3", "ambiguous")] });
  });
});
