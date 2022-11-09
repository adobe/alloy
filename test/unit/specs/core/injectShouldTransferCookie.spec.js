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

import injectShouldTransferCookie from "../../../../src/core/injectShouldTransferCookie";

describe("shouldTransferCookie", () => {
  let targetMigrationEnabled;
  let orgId;
  let shouldTransferCookie;

  beforeEach(() => {
    targetMigrationEnabled = false;
    orgId = "ABC@CustomOrg";
    shouldTransferCookie = null;
  });
  const build = () => {
    shouldTransferCookie = injectShouldTransferCookie({
      targetMigrationEnabled,
      orgId
    });
  };

  it("returns true if it's at_qa_mode cookie", () => {
    build();
    expect(shouldTransferCookie("at_qa_mode")).toBeTrue();
  });

  it("returns true if it's mbox cookie and targetMigrationEnabled=true", () => {
    targetMigrationEnabled = true;
    build();
    expect(shouldTransferCookie("mbox")).toBeTrue();
  });

  it("returns false if it's mbox cookie and targetMigrationEnabled=false", () => {
    build();
    expect(shouldTransferCookie("mbox")).toBeFalse();
  });

  it("returns false if it's not a legacy cookie name", () => {
    targetMigrationEnabled = true;
    build();
    expect(shouldTransferCookie("foo")).toBeFalse();
  });

  it("returns true for kndctr cookies", () => {
    build();
    expect(shouldTransferCookie("kndctr_ABC_CustomOrg_mynewcookie")).toBeTrue();
  });
});
