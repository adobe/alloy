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
import createMeasurementSchemaHandler from "../../../../../../src/components/Personalization/handlers/createMeasurementSchemaHandler";

describe("Personalization::handlers::createMeasurementSchemaHandler", () => {
  let next;
  let proposition;
  let handle;
  let handler;

  beforeEach(() => {
    next = jasmine.createSpy("next");
    proposition = jasmine.createSpyObj("proposition", ["getHandle"]);
    proposition.getHandle.and.callFake(() => handle);
    handler = createMeasurementSchemaHandler({ next });
  });

  it("handles an empty proposition", () => {
    handle = {};
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("handles an empty set of items", () => {
    handle = { items: [] };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("does not pass on a proposition with a measurment schema", () => {
    handle = {
      items: [{ schema: "https://ns.adobe.com/personalization/measurement" }]
    };
    handler(proposition);
    expect(next).not.toHaveBeenCalled();
  });
});
