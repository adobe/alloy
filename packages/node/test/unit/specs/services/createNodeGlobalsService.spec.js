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
import createNodeGlobalsService from "../../../../src/services/createNodeGlobalsService.js";

describe("createNodeGlobalsService", () => {
  it("has no page/DOM/script queue to report, so those default to empty", () => {
    const globalsService = createNodeGlobalsService();
    expect(globalsService.getInstanceNames()).toEqual([]);
    expect(globalsService.getInstanceQueue("alloy")).toEqual([]);
    expect(globalsService.getMonitors()).toEqual([]);
    expect(globalsService.getLocationSearch()).toBe("");
    expect(globalsService.getLocationHash()).toBe("");
    expect(globalsService.getUserAgent()).toBe("");
    expect(globalsService.getHostname()).toBe("");
    expect(globalsService.getPageLocation()).toEqual({
      host: "",
      pathname: "",
    });
    expect(globalsService.getWindowContext()).toEqual({
      title: "",
      url: "",
      referrer: "",
      height: 0,
      width: 0,
      scrollY: 0,
      scrollX: 0,
    });
  });

  it("isPageSsl defaults to true — the Edge Network requires HTTPS", () => {
    expect(createNodeGlobalsService().isPageSsl()).toBe(true);
  });

  it("fireReferrerHideableImage is a no-op that resolves — there's no image to fire in Node", async () => {
    await expect(
      createNodeGlobalsService().fireReferrerHideableImage({
        hideReferrer: true,
        url: "https://example.com",
      }),
    ).resolves.toBeUndefined();
  });
});
