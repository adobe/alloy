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

import initDomActionsModules, {
  DOM_ACTION_APPEND_HTML,
  DOM_ACTION_CUSTOM_CODE,
  DOM_ACTION_INSERT_AFTER,
  DOM_ACTION_INSERT_BEFORE,
  DOM_ACTION_MOVE,
  DOM_ACTION_PREPEND_HTML,
  DOM_ACTION_REARRANGE,
  DOM_ACTION_REMOVE,
  DOM_ACTION_REPLACE_HTML,
  DOM_ACTION_RESIZE,
  DOM_ACTION_SET_ATTRIBUTE,
  DOM_ACTION_SET_HTML,
  DOM_ACTION_SET_IMAGE_SOURCE,
  DOM_ACTION_SET_STYLE,
  DOM_ACTION_SET_TEXT,
  DOM_ACTION_TRACK_INTERACTION
} from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules";

const buildSet = () => {
  const result = new Set();

  // This is to make IE 11 happy
  result.add(DOM_ACTION_SET_HTML);
  result.add(DOM_ACTION_CUSTOM_CODE);
  result.add(DOM_ACTION_SET_TEXT);
  result.add(DOM_ACTION_SET_ATTRIBUTE);
  result.add(DOM_ACTION_SET_IMAGE_SOURCE);
  result.add(DOM_ACTION_SET_STYLE);
  result.add(DOM_ACTION_MOVE);
  result.add(DOM_ACTION_RESIZE);
  result.add(DOM_ACTION_REARRANGE);
  result.add(DOM_ACTION_REMOVE);
  result.add(DOM_ACTION_INSERT_AFTER);
  result.add(DOM_ACTION_INSERT_BEFORE);
  result.add(DOM_ACTION_REPLACE_HTML);
  result.add(DOM_ACTION_PREPEND_HTML);
  result.add(DOM_ACTION_APPEND_HTML);
  result.add(DOM_ACTION_TRACK_INTERACTION);

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
