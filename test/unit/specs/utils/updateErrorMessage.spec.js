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

import updateErrorMessage from "../../../../src/utils/updateErrorMessage";

describe("updateErrorMessage", () => {
  it("updates error message if the message property is writeable", () => {
    const error = new Error("Conundrum encountered.");
    const message = "Predicament discovered.";
    updateErrorMessage({ error, message });
    expect(error.message).toEqual("Predicament discovered.");
  });

  it("does not update error message if the message property is read-only", () => {
    let error;
    try {
      // This will cause a DOMException, which has a read-only message property.
      const invalidSelector = "div:foo";
      document.querySelectorAll(invalidSelector);
    } catch (e) {
      error = e;
    }
    updateErrorMessage({ error, message: "Predicament discovered." });
    expect(error.message).not.toContain("Predicament discovered.");
  });
});
