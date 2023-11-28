/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import injectCreateProposition from "../../../../../../src/components/Personalization/handlers/injectCreateProposition";

describe("injectCreateProposition", () => {
  const preprocess = data => `preprocessed ${data}`;
  const isPageWideSurface = scope => scope === "__surface__";
  const createProposition = injectCreateProposition({
    preprocess,
    isPageWideSurface
  });

  it("creates a proposition from nothing", () => {
    const proposition = createProposition({});

    expect(proposition.getScope()).toBeUndefined();
    expect(proposition.getScopeType()).toEqual("proposition");
    expect(proposition.getItems()).toEqual([]);
    expect(proposition.getNotification()).toEqual({
      id: undefined,
      scope: undefined,
      scopeDetails: undefined
    });
    expect(proposition.toJSON()).toEqual({});
  });

  it("creates a full proposition", () => {
    const proposition = createProposition({
      id: "id",
      scope: "scope",
      scopeDetails: { characteristics: { scopeType: "view" } },
      items: [
        {
          schema: "schema",
          data: "data",
          characteristics: { trackingLabel: "trackingLabel" }
        }
      ]
    });

    expect(proposition.getScope()).toEqual("scope");
    expect(proposition.getScopeType()).toEqual("view");
    const item = proposition.getItems()[0];
    expect(item.getSchema()).toEqual("schema");
    expect(item.getData()).toEqual("preprocessed data");
    expect(item.getProposition()).toEqual(proposition);
    expect(item.getTrackingLabel()).toEqual("trackingLabel");
    expect(item.getOriginalItem()).toEqual({
      schema: "schema",
      data: "data",
      characteristics: { trackingLabel: "trackingLabel" }
    });
    expect(proposition.getNotification()).toEqual({
      id: "id",
      scope: "scope",
      scopeDetails: { characteristics: { scopeType: "view" } }
    });
  });

  it("creates a page wide surface proposition", () => {
    const proposition = createProposition({
      scope: "__surface__"
    });
    expect(proposition.getScopeType()).toEqual("page");
  });

  it("creates a page wide scope proposition", () => {
    const proposition = createProposition({
      scope: "__view__"
    });
    expect(proposition.getScopeType()).toEqual("page");
  });
});
