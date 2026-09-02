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

import { describe, it, expect, vi } from "vitest";
import createContext from "../../../../src/components/context.js";

const createFakeEvent = () => ({
  mergeXdm: vi.fn(),
});

describe("Node context component", () => {
  it("has the Context namespace", () => {
    expect(createContext.namespace).toBe("Context");
  });

  it("always attaches implementationDetails with a server environment", async () => {
    const event = createFakeEvent();
    const { lifecycle } = createContext({ platformServices: {} });

    await lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({
      implementationDetails: expect.objectContaining({
        environment: "server",
      }),
    });
  });

  it("does not merge web.webPageDetails when no request was given", async () => {
    const event = createFakeEvent();
    const { lifecycle } = createContext({ platformServices: {} });

    await lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).not.toHaveBeenCalledWith(
      expect.objectContaining({ web: expect.anything() }),
    );
  });

  it("does not merge web.webPageDetails when the request has no referer header", async () => {
    const event = createFakeEvent();
    const { lifecycle } = createContext({
      platformServices: { request: { headers: {} } },
    });

    await lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).not.toHaveBeenCalledWith(
      expect.objectContaining({ web: expect.anything() }),
    );
  });

  it("merges web.webPageDetails.URL from the request's referer header", async () => {
    const event = createFakeEvent();
    const { lifecycle } = createContext({
      platformServices: {
        request: { headers: { referer: "https://example.com/page" } },
      },
    });

    await lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({
      web: { webPageDetails: { URL: "https://example.com/page" } },
    });
  });

  it("merges web.webPageDetails.URL from a WHATWG Headers instance's referer header", async () => {
    const event = createFakeEvent();
    const { lifecycle } = createContext({
      platformServices: {
        request: {
          headers: new Headers({ referer: "https://example.com/page" }),
        },
      },
    });

    await lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({
      web: { webPageDetails: { URL: "https://example.com/page" } },
    });
  });
});
