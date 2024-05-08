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

import injectTimestamp from "../../../../../src/components/Context/injectTimestamp.js";

describe("Context::injectTimestamp", () => {
  let dateProvider;
  const date = new Date("November 25, 2019 10:09:42 UTC");

  beforeEach(() => {
    dateProvider = () => {
      return date;
    };
  });

  it("adds timestamp", () => {
    const xdm = {};
    injectTimestamp(dateProvider)(xdm);
    expect(xdm).toEqual({
      timestamp: "2019-11-25T10:09:42.000Z"
    });
  });
});
