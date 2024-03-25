/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createRedirect from "../../../../../../src/components/Personalization/dom-actions/createRedirect";

describe("createRedirect", () => {
  it("redirects", () => {
    const window = {
      location: {
        replace: jasmine.createSpy(),
        href: jasmine.createSpy()
      }
    };
    const redirect = createRedirect(window);
    redirect("myurl");
    expect(window.location.replace).toHaveBeenCalledWith("myurl");
    expect(window.location.href).not.toHaveBeenCalled();
  });

  it("redirects using window.location.href when preserveHistory is true", () => {
    const window = {
      location: {
        href: jasmine.createSpy(),
        replace: jasmine.createSpy()
      }
    };
    const redirectUrl = "https://www.adobe.com";
    const redirect = createRedirect(window);
    redirect(redirectUrl, true);
    expect(window.location.href).toBe(redirectUrl);
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
