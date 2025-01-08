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
import { expect } from "vitest";

/**
 * Asserts that functions were called in a particular order.
 * @param {Array} orderedFunctions The array of functions in the order
 * they should have been called.
 */
export default (orderedFunctions) => {
  for (let i = 0; i < orderedFunctions.length - 1; i += 1) {
    const callOrder1 = orderedFunctions[i].mock.invocationCallOrder[0];
    const callOrder2 = orderedFunctions[i + 1].mock.invocationCallOrder[0];
    expect(callOrder1).toBeLessThan(callOrder2);
  }
};
