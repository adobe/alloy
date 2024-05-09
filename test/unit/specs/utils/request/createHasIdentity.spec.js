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
import {
  createHasIdentity,
  createAddIdentity,
} from "../../../../../src/utils/request";

describe("createHasIdentity", () => {
  let content;
  let hasIdentity;
  let addIdentity;

  beforeEach(() => {
    content = {};
    hasIdentity = createHasIdentity(content);
    addIdentity = createAddIdentity(content);
  });

  it("should return false when no xdm has been set", () => {
    expect(hasIdentity("myid")).toBe(false);
  });
  it("should return false if no identity has been set", () => {
    content.xdm = {};
    expect(hasIdentity("myid")).toBe(false);
  });
  it("should return false if there are other identities", () => {
    addIdentity("other", "myotherid");
    expect(hasIdentity("myid")).toBe(false);
  });
  it("should return true when there already is an identity", () => {
    addIdentity("myid", "myidvalue");
    expect(hasIdentity("myid")).toBe(true);
  });
});
