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
} from "../../../../../../src/components/Personalization/dom-actions/scripts";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { createFragment } from "../../../../../../src/components/Personalization/dom-actions/dom";
import { DIV } from "../../../../../../src/constants/tagName";
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

  it("should return null if inlineScript doesn't have text code", () => {
    const fragmentHTML =
      "<script></script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);

    const inlineScripts = getInlineScripts(fragment);
    expect(inlineScripts.length).toEqual(0);
  });

  it("should get a remote script", () => {
    const fragmentHTML =
      "<div id='fooDiv'><script src='http://foo.com' ></script><script>console.log('test');</script></div>";
    const fragment = createFragment(fragmentHTML);
    const remoteScripts = getRemoteScriptsUrls(fragment);

    expect(remoteScripts.length).toEqual(1);
    expect(remoteScripts[0]).toEqual("http://foo.com");
  });

  it("should get a empty array if remote script doesn't have url attr", () => {
    const fragmentHTML =
      "<div id='fooDiv'><script src='' ></script><script>console.log('test');</script></div>";
    const fragment = createFragment(fragmentHTML);
    const remoteScripts = getRemoteScriptsUrls(fragment);

    expect(remoteScripts.length).toEqual(0);
  });

  it("should execute inline script", () => {
    const fragmentHTML =
      "<script>console.log('test');</script><script src='http://foo.com' ></script>";
    const fragment = createFragment(fragmentHTML);
    const inlineScripts = getInlineScripts(fragment);
    const container = createNode(DIV);
    spyOn(container, "appendChild").and.callThrough();
    spyOn(container, "removeChild").and.callThrough();

    executeInlineScripts(container, inlineScripts);

    expect(container.appendChild).toHaveBeenCalledWith(inlineScripts[0]);
    expect(container.removeChild).toHaveBeenCalledWith(inlineScripts[0]);
  });
});
