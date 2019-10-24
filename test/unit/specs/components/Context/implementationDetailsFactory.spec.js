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

import implementationDetailsFactory from "../../../../../src/components/Context/implementationDetailsFactory";

describe("Context::versionFactory", () => {
  const version = "1.2.3";
  let event;
  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeXdm"]);
  });

  it("works", () => {
    implementationDetailsFactory(version)(event);
    expect(event.mergeXdm).toHaveBeenCalledWith({
      implementationDetails: {
        name: "https://ns.adobe.com/experience/alloy",
        version: "1.2.3",
        environment: "web"
      }
    });
  });
});
