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
import { DOM_ACTION } from "../../../../../src/constants/schema.js";
import createPreprocessors from "../../../../../src/components/Personalization/createPreprocessors.js";

describe("Personalization::createPreprocessors", () => {
  it("has dom-action preprocessors", () => {
    const preprocessors = createPreprocessors();

    expect(preprocessors).toEqual({
      [DOM_ACTION]: jasmine.any(Array)
    });

    expect(preprocessors[DOM_ACTION].length).toEqual(2);

    preprocessors[DOM_ACTION].forEach(preprocessor => {
      expect(preprocessor).toEqual(jasmine.any(Function));
    });
  });

  it("is structured correctly", () => {
    const preprocessors = createPreprocessors();

    Object.keys(preprocessors).forEach(key => {
      expect(
        key.startsWith("https://ns.adobe.com/personalization/")
      ).toBeTrue();
    });

    Object.values(preprocessors).forEach(list => {
      expect(list instanceof Array).toBeTrue();
      list.forEach(preprocessor => {
        expect(preprocessor).toEqual(jasmine.any(Function));
      });
    });
  });
});
