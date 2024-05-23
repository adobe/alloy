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

import getVisitor from "../../../../../../src/components/Identity/visitorService/getVisitor.js";

describe("getVisitor", () => {
  let mockWindow;

  beforeEach(() => {
    mockWindow = {};
  });

  it("Returns Visitor function if Visitor is available and valid", () => {
    mockWindow.Visitor = jasmine.createSpy();
    mockWindow.Visitor.getInstance = jasmine.createSpy();
    expect(getVisitor(mockWindow)).toEqual(mockWindow.Visitor);
  });
  it("Returns false if Visitor is available but does not support getInstance", () => {
    mockWindow.Visitor = jasmine.createSpy();
    expect(getVisitor(mockWindow)).toBe(false);
  });
  it("Returns false if Visitor is not available", () => {
    expect(getVisitor(mockWindow)).toBe(false);
  });
});
