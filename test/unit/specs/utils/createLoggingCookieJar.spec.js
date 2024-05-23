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

import createLoggingCookieJar from "../../../../src/utils/createLoggingCookieJar.js";

describe("loggingCookieJar", () => {
  let cookieJar;
  let logger;
  let loggingCookieJar;

  beforeEach(() => {
    cookieJar = jasmine.createSpyObj("cookieJar", ["set", "get"]);
    logger = jasmine.createSpyObj("logger", ["info"]);
    loggingCookieJar = createLoggingCookieJar({ cookieJar, logger });
  });

  it("logs a message", () => {
    loggingCookieJar.set("mykey", "myvalue", { myoption: "myoptionvalue" });
    expect(logger.info).toHaveBeenCalledOnceWith("Setting cookie", {
      name: "mykey",
      value: "myvalue",
      myoption: "myoptionvalue",
    });
  });

  it("calls set", () => {
    loggingCookieJar.set("mykey", "myvalue", { myoption: "myoptionvalue" });
    expect(cookieJar.set).toHaveBeenCalledOnceWith("mykey", "myvalue", {
      myoption: "myoptionvalue",
    });
  });

  it("calls get", () => {
    loggingCookieJar.get("mykey");
    expect(cookieJar.get).toHaveBeenCalledOnceWith("mykey");
  });

  it("returns the value from get", () => {
    cookieJar.get.and.returnValue("myvalue");
    expect(loggingCookieJar.get("mykey")).toEqual("myvalue");
  });
});
