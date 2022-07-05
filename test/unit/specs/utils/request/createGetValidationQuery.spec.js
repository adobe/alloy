/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createGetValidationQuery } from "../../../../../src/utils/request";

const win = {
  location: {
    search: ""
  }
};

describe("createGetValidationQuery", () => {
  it("gets validation query", () => {
    const getValidationQuery = createGetValidationQuery({ window: win });
    expect(getValidationQuery()).toEqual("");

    win.location.search = "?adobeAepValidationToken=abc-123";
    expect(getValidationQuery()).toEqual("&adobeAepValidationToken=abc-123");

    win.location.search = "?adobeAepValidationToken=abc-123%20fgh";
    expect(getValidationQuery()).toEqual(
      "&adobeAepValidationToken=abc-123%20fgh"
    );

    win.location.search =
      "?lang=en&sort=relevancy&f:el_product=[Data%20Collection]&adobeAepValidationToken=abc-123";
    expect(getValidationQuery()).toEqual("&adobeAepValidationToken=abc-123");

    win.location.search =
      "?lang=en&sort=relevancy&f:el_product=[Data%20Collection]";
    expect(getValidationQuery()).toEqual("");

    win.location.search = "?adobeAepValidationToken=";
    expect(getValidationQuery()).toEqual("");
  });
});
