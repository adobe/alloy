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

// eslint-disable-next-line no-unused-vars
import querystring from "../../../../src/utils/querystring";

describe("querystring", () => {
  it("querystring.parse('?alloy_debug=true')", () => {
    expect(querystring.parse("?alloy_debug=true")).toEqual({
      alloy_debug: "true"
    });
  });

  it("querystring.parse('?qp=one&alloy_debug=true&qp2=two')", () => {
    expect(querystring.parse("?qp=one&alloy_debug=true&qp2=two")).toEqual({
      qp: "one",
      alloy_debug: "true",
      qp2: "two"
    });
  });

  it("querystring.parse('?qp=first&qp=second')", () => {
    expect(querystring.parse("?qp=first&qp=second")).toEqual({
      qp: ["first", "second"]
    });
  });
});
