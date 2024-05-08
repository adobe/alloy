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
import { createAddIdentity } from "../../../../../src/utils/request/index.js";

describe("createAddIdentity", () => {
  it("should return a function to add identity", () => {
    const content = {};
    const addIdentity = createAddIdentity(content);
    expect(typeof addIdentity).toBe("function");
    addIdentity("IDNS", {
      id: "ABC123"
    });
    expect(content).toEqual({
      xdm: {
        identityMap: {
          IDNS: [
            {
              id: "ABC123"
            }
          ]
        }
      }
    });
  });
  it("should append identity map if called more than once", () => {
    const content = {};
    const addIdentity = createAddIdentity(content);
    addIdentity("IDNS", {
      id: "ABC123"
    });
    addIdentity("IDNS", {
      id: "ABC456"
    });
    expect(content).toEqual({
      xdm: {
        identityMap: {
          IDNS: [
            {
              id: "ABC123"
            },
            {
              id: "ABC456"
            }
          ]
        }
      }
    });
    addIdentity("IDNS2", {
      id: "ABC456"
    });
    expect(content).toEqual({
      xdm: {
        identityMap: {
          IDNS: [
            {
              id: "ABC123"
            },
            {
              id: "ABC456"
            }
          ],
          IDNS2: [
            {
              id: "ABC456"
            }
          ]
        }
      }
    });
  });
});
