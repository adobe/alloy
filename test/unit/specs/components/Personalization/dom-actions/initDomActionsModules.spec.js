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

import initDomActionsModules from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules";

const buildSet = () => {
  const result = new Set();

  // This is to make IE 11 happy
  result.add("setHtml");
  result.add("customCode");
  result.add("setText");
  result.add("setAttribute");
  result.add("setImageSource");
  result.add("setStyle");
  result.add("move");
  result.add("resize");
  result.add("rearrange");
  result.add("remove");
  result.add("insertAfter");
  result.add("insertBefore");
  result.add("replaceHtml");
  result.add("prependHtml");
  result.add("appendHtml");
  result.add("click");

  return result;
};

const STANDARD_MODULES = buildSet();

describe("Personalization::turbine::initDomActionsModules", () => {
  it("should have all the required modules", () => {
    const result = initDomActionsModules(() => {});
    const keys = Object.keys(result);

    expect(keys.length).toEqual(STANDARD_MODULES.size);

    Object.keys(result).forEach(key => {
      expect(STANDARD_MODULES.has(key)).toEqual(true);
    });
  });
});
