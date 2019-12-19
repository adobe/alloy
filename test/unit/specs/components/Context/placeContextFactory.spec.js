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

import placeContextFactory from "../../../../../src/components/Context/placeContextFactory";

describe("Context::placeContextFactory", () => {
  let dateProvider;
  const date = new Date("March 25, 2019 21:56:18");

  beforeEach(() => {
    dateProvider = () => {
      return date;
    };
  });

  it("adds placeContext", () => {
    spyOn(date, "getTimezoneOffset").and.returnValue(7 * 60);
    const xdm = {};
    placeContextFactory(dateProvider)(xdm);
    expect(xdm).toEqual({
      placeContext: {
        localTime: "2019-03-25T21:56:18.000-07:00",
        localTimezoneOffset: 7 * 60
      }
    });
  });
});
