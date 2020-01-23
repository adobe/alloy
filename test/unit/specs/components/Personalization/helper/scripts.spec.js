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

import {
  getInlineScripts,
  getRemoteScriptsUrls,
  executeInlineScripts
} from "../../../../../../src/components/Personalization/helper/scripts";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { createFragment } from "../../../../../../src/components/Personalization/helper/dom";
import { DIV } from "../../../../../../src/constants/tagNames";
import { createNode } from "../../../../../../src/utils/dom";

describe("Personalization::helper::scripts", () => {
  beforeEach(() => {
    cleanUpDomChanges("fooDiv");
  });

  afterEach(() => {
    cleanUpDomChanges("fooDiv");
  });

  it("should get an inline script", () => {
    const fragmentHTML =
      "<script>console.log('test');</script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);

    const inlineScripts = getInlineScripts(fragment);
    expect(inlineScripts.length).toEqual(1);
  });

  it("should get a remote script", () => {
    const fragmentHTML =
      "<div id='fooDiv'><script src='http://foo.com' ></script><script>console.log('test');</script></div>";
    const fragment = createFragment(fragmentHTML);

    const remoteScripts = getRemoteScriptsUrls(fragment);
    expect(remoteScripts.length).toEqual(1);
    expect(remoteScripts[0]).toEqual("http://foo.com");
  });

  it("should execute inline script", () => {
    const fragmentHTML =
      "<script>console.log('test');</script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);
    const inlineScripts = getInlineScripts(fragment);
    const func = jasmine.createSpy();
    const container = createNode(DIV);

    executeInlineScripts(container, inlineScripts, func);

    expect(func).toHaveBeenCalledWith(container, inlineScripts[0]);
  });
});
