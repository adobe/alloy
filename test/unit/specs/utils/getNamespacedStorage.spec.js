/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import injectStorage from "../../../../src/utils/injectStorage";

const getNamespacedStorage = injectStorage(window);
const storage = getNamespacedStorage("namespace");

describe("getNamespacedStorage", () => {
  it("is able to write and read from session storage", () => {
    storage.session.setItem("test", "session-storage");
    expect(storage.session.getItem("test")).toBe("session-storage");
  });
  it("is able to write and read from persistent storage", () => {
    storage.persistent.setItem("test", "persistent-storage");
    expect(storage.persistent.getItem("test")).toBe("persistent-storage");
  });
});
