/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import pickForwardableHeaders from "../../../../src/services/pickForwardableHeaders.js";

describe("pickForwardableHeaders", () => {
  it("returns an empty object when called with no headers", () => {
    expect(pickForwardableHeaders()).toEqual({});
  });

  it("picks user-agent, accept-language, client hints, and IP-forwarding headers, dropping everything else", () => {
    const picked = pickForwardableHeaders({
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": '"Chromium";v="128"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "x-forwarded-for": "203.0.113.1",
      cookie: "should-not-be-forwarded",
      host: "example.com",
    });

    expect(picked).toEqual({
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
      "sec-ch-ua": '"Chromium";v="128"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "x-forwarded-for": "203.0.113.1",
    });
  });

  it("drops a header that's an array (repeated header) instead of forwarding a stringified version", () => {
    const picked = pickForwardableHeaders({
      "user-agent": ["Mozilla/5.0", "SomethingElse/1.0"],
    });

    expect(picked).toEqual({});
  });

  it("drops an empty-string header value", () => {
    const picked = pickForwardableHeaders({ "user-agent": "" });

    expect(picked).toEqual({});
  });

  it("picks headers off a WHATWG Headers instance, e.g. a fetch-standard Request", () => {
    const headers = new Headers({
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
      cookie: "should-not-be-forwarded",
    });

    const picked = pickForwardableHeaders(headers);

    expect(picked).toEqual({
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
    });
  });
});
