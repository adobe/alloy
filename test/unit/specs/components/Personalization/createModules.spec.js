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
import createModules from "../../../../../src/components/Personalization/createModules";
import {
  DOM_ACTION,
  IN_APP_MESSAGE
} from "../../../../../src/components/Personalization/constants/schema";

describe("createModules", () => {
  const noop = () => undefined;

  it("has dom-action modules", () => {
    const modules = createModules({ storeClickMetrics: noop, collect: noop });

    expect(modules[DOM_ACTION]).toEqual({
      setHtml: jasmine.any(Function),
      customCode: jasmine.any(Function),
      setText: jasmine.any(Function),
      setAttribute: jasmine.any(Function),
      setImageSource: jasmine.any(Function),
      setStyle: jasmine.any(Function),
      move: jasmine.any(Function),
      resize: jasmine.any(Function),
      rearrange: jasmine.any(Function),
      remove: jasmine.any(Function),
      insertAfter: jasmine.any(Function),
      insertBefore: jasmine.any(Function),
      replaceHtml: jasmine.any(Function),
      prependHtml: jasmine.any(Function),
      appendHtml: jasmine.any(Function),
      click: jasmine.any(Function),
      defaultContent: jasmine.any(Function)
    });

    expect(Object.keys(modules[DOM_ACTION]).length).toEqual(17);
  });

  it("has in-app-message modules", () => {
    const modules = createModules({ storeClickMetrics: noop, collect: noop });

    expect(modules[IN_APP_MESSAGE]).toEqual({
      modal: jasmine.any(Function),
      banner: jasmine.any(Function)
    });

    expect(Object.keys(modules[IN_APP_MESSAGE]).length).toEqual(2);
  });
});
