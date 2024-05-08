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
import { selectNodes, removeNode } from "../../../../../../src/utils/dom/index.js";
import {
  hideElements,
  showElements
} from "../../../../../../src/components/Personalization/flicker";

describe("Personalization::flicker", () => {
  beforeEach(() => {
    selectNodes("style").forEach(removeNode);
  });

  afterEach(() => {
    selectNodes("style").forEach(removeNode);
  });

  it("should add prehiding style tags", () => {
    const prehidingSelector = ".add";

    hideElements(prehidingSelector);

    const styles = selectNodes("style");

    expect(styles.length).toEqual(1);

    const styleDefinition = styles[0].textContent;

    expect(styleDefinition).toEqual(
      `${prehidingSelector} { visibility: hidden }`
    );
  });

  it("should remove prehiding style tags", () => {
    const prehidingSelector = ".remove";

    hideElements(prehidingSelector);
    showElements(prehidingSelector);

    const styles = selectNodes("style");

    expect(styles.length).toEqual(0);
  });
});
