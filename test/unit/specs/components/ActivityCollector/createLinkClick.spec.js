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

import createLinkClick from "../../../../../src/components/ActivityCollector/createLinkClick";
import createEvent from "../../../../../src/core/createEvent";
import createConfigValidators from "../../../../../src/components/ActivityCollector/createConfigValidators";

describe("ActivityCollector::createLinkClick", () => {
  const cfgValidators = createConfigValidators();
  const config = {
    downloadLinkQualifier: cfgValidators.downloadLinkQualifier.defaultValue
  };
  const mockWindow = {
    location: {
      protocol: "https:",
      host: "example.com",
      hostname: "example.com",
      pathname: "/"
    }
  };
  const supportedLinkElement = {
    tagName: "A",
    href: "index.html"
  };
  const unsupportedLinkElement = {
    tagName: "LINK",
    href: "index.html"
  };
  const linkClick = createLinkClick(mockWindow, config);
  it("Extends event XDM data with link information for supported anchor elements", () => {
    const event = createEvent();
    linkClick(event, supportedLinkElement);
    expect(event.isEmpty()).toBe(false);
  });
  it("Does not extend event XDM data with link information for unsupported anchor elements", () => {
    const event = createEvent();
    linkClick(event, unsupportedLinkElement);
    expect(event.isEmpty()).toBe(true);
  });
});
