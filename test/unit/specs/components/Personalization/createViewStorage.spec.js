/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createViewStorage from "../../../../../src/components/Personalization/createViewStorage";

describe("Personalization::createViewStorage", () => {
  const viewDecisions = {
    home: [
      {
        id: "foo1",
        items: [],
        scope: "home"
      },
      {
        id: "foo2",
        items: [],
        scope: "home"
      }
    ],
    cart: [
      {
        id: "foo3",
        items: [],
        scope: "cart"
      }
    ]
  };

  it("stores and gets the decisions based on a viewName", () => {
    const viewStorage = createViewStorage();
    viewStorage.storeViews(viewDecisions);
    const cartDecisions = viewStorage.get("cart");
    const homeDecisions = viewStorage.get("home");

    expect(cartDecisions.length).toEqual(1);
    expect(homeDecisions.length).toEqual(2);
  });
});
