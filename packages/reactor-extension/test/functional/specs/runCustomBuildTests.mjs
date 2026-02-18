/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import extensionViewController from "../helpers/extensionViewController.mjs";
import spectrum from "../helpers/spectrum.mjs";

const warning = spectrum.alert("requiredComponentWarning");
const error = spectrum.alert("requiredComponentError");

export default ({ requiredComponent, minimumValidSettings }) => {
  test("prevents you from creating when the required component is excluded", async () => {
    await extensionViewController.init({
      extensionSettings: {
        instances: [{ name: "alloy" }],
        components: { [requiredComponent]: false },
      },
      settings: null,
    });

    await error.expectExists();
    await warning.expectNotExists();

    await extensionViewController.expectIsNotValid();
  });

  test("allows you to save when the required component is excluded", async () => {
    await extensionViewController.init({
      extensionSettings: {
        instances: [{ name: "alloy" }],
        components: { [requiredComponent]: false },
      },
      settings: minimumValidSettings,
    });

    await error.expectNotExists();
    await warning.expectExists();

    await extensionViewController.expectIsValid();
  });

  test("shows no alerts when the required component is included", async () => {
    await extensionViewController.init({
      extensionSettings: {
        instances: [{ name: "alloy" }],
        components: { [requiredComponent]: true },
      },
      settings: minimumValidSettings,
    });

    await error.expectNotExists();
    await warning.expectNotExists();

    await extensionViewController.expectIsValid();
  });
};
