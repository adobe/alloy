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

import injectPlaceContext from "../../../../../src/components/Context/injectPlaceContext";

describe("Context::injectPlaceContext", () => {
  it("adds placeContext", () => {
    const date = new Date("March 25, 2019 21:56:18");
    spyOn(date, "getTimezoneOffset").and.returnValue(7 * 60);
    const xdm = {};
    injectPlaceContext(() => date)(xdm);
    expect(xdm).toEqual({
      placeContext: {
        localTime: "2019-03-25T21:56:18.000-07:00",
        localTimezoneOffset: 7 * 60
      }
    });
  });

  it("handles string values from timezoneOffset", () => {
    const date = new Date("May 19, 2022 13:43:42");
    spyOn(date, "getTimezoneOffset").and.returnValue("55.1");
    const xdm = {};
    injectPlaceContext(() => date)(xdm);
    expect(xdm).toEqual({
      placeContext: {
        localTime: "2022-05-19T13:43:42.000-00:55",
        localTimezoneOffset: 55
      }
    });
  });

  it("handles NaN timezoneOffsets", () => {
    const date = new Date("May 19, 2022 13:43:42");
    spyOn(date, "getTimezoneOffset").and.returnValue("foo");
    const xdm = {};
    injectPlaceContext(() => date)(xdm);
    expect(xdm).toEqual({
      placeContext: {
        localTime: "2022-05-19T13:43:42.000+00:00"
      }
    });
  });
});
