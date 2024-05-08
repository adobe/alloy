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

import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";
import {
  createFragment,
  getChildNodes
} from "../../../../../../src/components/Personalization/dom-actions/dom";
import {
  isImage,
  loadImage
} from "../../../../../../src/components/Personalization/dom-actions/images";
import { IMG } from "../../../../../../src/constants/tagName.js";
import { createNode } from "../../../../../../src/utils/dom/index.js";

describe("Personalization::helper::images", () => {
  beforeEach(() => {
    cleanUpDomChanges("fooImage");
  });

  afterEach(() => {
    cleanUpDomChanges("fooImage");
  });

  it("should verify if it is an image", () => {
    const fragmentHTML = "<img id='fooImage' src='http://foo.com' />";
    const fragment = createFragment(fragmentHTML);
    const imageNode = getChildNodes(fragment)[0];

    expect(isImage(fragment)).toBeFalse();
    expect(isImage(imageNode)).toBeTrue();
  });

  it("should create an image node", () => {
    const result = loadImage("http://foo.com");
    const image = createNode(IMG, { src: "http://foo.com" });

    expect(result).toEqual(image);
  });
});
