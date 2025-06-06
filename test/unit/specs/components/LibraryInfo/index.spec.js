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
import { beforeEach, describe, it, expect } from "vitest";
import createLibraryInfo from "../../../../../src/components/LibraryInfo/index.js";

describe("LibraryInfo", () => {
  let toolsMock;
  beforeEach(() => {
    toolsMock = {
      config: {
        foo: "bar",
      },
      componentRegistry: {
        getCommandNames: () => ["bar"],
        getComponentNames: () => ["ComponentA", "ComponentB"],
      },
    };
  });
  it("returns library, command, and config information", () => {
    expect(createLibraryInfo(toolsMock).commands.getLibraryInfo.run()).toEqual({
      libraryInfo: {
        version: expect.any(String),
        configs: {
          foo: "bar",
        },
        commands: ["bar", "configure", "setDebug"],
        components: ["ComponentA", "ComponentB"],
      },
    });
  });
});
