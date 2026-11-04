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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import useView from "../helpers/useView";
import { worker } from "../helpers/mocks/browser";
import field from "../helpers/field";
import IdentityMapView from "../../../src/view/dataElements/identityMapView";

const identifier = (overrides) => ({
  id: "id",
  authenticatedState: "ambiguous",
  primary: false,
  ...overrides,
});

describe("Identity map data element validation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    worker.use(
      http.get(
        "https://platform.adobe.io/data/core/idnamespace/identities",
        () => HttpResponse.json([]),
      ),
    );
    ({ view, driver, cleanup } = await useView(IdentityMapView));
  });

  afterEach(() => cleanup());

  it("accepts a valid identity map", async () => {
    await driver.init({
      settings: { CRM: [identifier({ primary: true })] },
    });

    await driver.expectValidate().toBe(true);
  });

  it("requires an identifier ID", async () => {
    await driver.init({ settings: { CRM: [identifier({ id: "" })] } });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("identity0idField0")).expectError(
      /please specify an id/i,
    );
  });

  it("does not allow the ECID namespace", async () => {
    await driver.init({ settings: { ecid: [identifier()] } });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("namespace0Field")).expectError(
      /ecid is not allowed/i,
    );
  });

  it("requires namespaces to be unique regardless of case", async () => {
    await driver.init({
      settings: { crm: [identifier()], CRM: [identifier({ id: "other" })] },
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("namespace1Field")).expectError(
      /please provide a unique namespace/i,
    );
  });

  it("allows only one primary identifier", async () => {
    await driver.init({
      settings: {
        CRM: [
          identifier({ primary: true }),
          identifier({ id: "other", primary: true }),
        ],
      },
    });

    await driver.expectValidate().toBe(false);
    await expect
      .element(view.getByText(/only one identifier can be primary/i))
      .toBeVisible();
  });
});
