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
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";

describe("Personalization::actions::click", () => {
  it("should set click tracking attribute", () => {
    const store = jasmine.createSpy();
    const modules = initDomActionsModules(store);
    const { click } = modules;
    const selector = "#click";
    const meta = { a: 1 };
    const settings = { selector, meta };

    click(settings, store);

    expect(store).toHaveBeenCalledWith({ selector, meta });
  });
});
