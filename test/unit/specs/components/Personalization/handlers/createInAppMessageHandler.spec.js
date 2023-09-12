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
import createInAppMessageHandler from "../../../../../../src/components/Personalization/handlers/createInAppMessageHandler";

describe("Personalization::handlers::createInAppMessageHandler", () => {
  let next;
  let modules;
  let action1;
  let handler;

  let proposition;
  let handle;

  beforeEach(() => {
    next = jasmine.createSpy("next");
    action1 = jasmine.createSpy("defaultContent");
    modules = { defaultContent: action1 };
    handler = createInAppMessageHandler({
      next,
      modules
    });
    proposition = jasmine.createSpyObj("proposition1", [
      "getHandle",
      "includeInDisplayNotification",
      "addRenderer",
      "getItemMeta"
    ]);
    proposition.getHandle.and.callFake(() => handle);
    proposition.getItemMeta.and.callFake(index => `meta${index}`);
  });

  it("handles an empty proposition", () => {
    handle = {};
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(action1).not.toHaveBeenCalled();
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
  });

  it("handles an in app message item", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/message/in-app",
          data: {
            type: "modal",
            horizontalAlign: "center",
            verticalAlign: "center",
            closeButton: true,
            dimBackground: true,
            content: "<span>Special offer, don't delay!</span>"
          },
          id: "123"
        }
      ]
    };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(proposition.includeInDisplayNotification).toHaveBeenCalledOnceWith();
    expect(proposition.addRenderer).toHaveBeenCalledOnceWith(
      0,
      jasmine.any(Function)
    );
    proposition.addRenderer.calls.argsFor(0)[1]();
    expect(action1).toHaveBeenCalledTimes(1);
  });
});
