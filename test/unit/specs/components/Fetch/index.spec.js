/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createFetch from "../../../../../src/components/Fetch/index";

describe("createFetch", () => {
  let eventManager;
  let event;
  let fetch;

  beforeEach(() => {
    eventManager = jasmine.createSpyObj("eventManager", [
      "fetch",
      "createEvent"
    ]);
    event = jasmine.createSpyObj("event", ["setUserXdm", "setUserData"]);
    eventManager.createEvent.and.returnValue(event);
    fetch = createFetch({ eventManager });
  });

  it("sets user XDM and data", () => {
    const xdm = { myxdm: "myvalue" };
    const data = { mydata: "myvalue" };
    fetch.commands.fetch.run({ xdm, data });
    expect(event.setUserXdm).toHaveBeenCalledOnceWith(xdm);
    expect(event.setUserData).toHaveBeenCalledOnceWith(data);
  });

  it("calls fetch on event manager", () => {
    fetch.commands.fetch.run({});
    expect(eventManager.fetch).toHaveBeenCalledOnceWith(event, {
      personalization: {}
    });
  });
});
