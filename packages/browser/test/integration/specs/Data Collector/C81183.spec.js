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
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import alloyConfig from "../../helpers/alloy/config.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import setupBaseCode from "../../helpers/alloy/setupBaseCode.js";
import { appendLink, cleanupDom } from "../../helpers/utils/domHelpers.js";

describe("C81183 - getLinkDetails monitoring hook via __alloyMonitors", () => {
  let alloy;

  beforeEach(async () => {
    window.__alloyMonitors = [
      {
        onInstanceConfigured(data) {
          window.___getLinkDetails = data.getLinkDetails;
        },
      },
    ];

    await setupBaseCode();
    alloy = await setupAlloy();
  });

  afterEach(() => {
    cleanAlloy();
    cleanupDom();
  });

  const expectedInternalLinkDetails = () => ({
    linkName: "Test Link",
    linkRegion: "BODY",
    linkType: "other",
    linkUrl: new URL("valid.html", window.location.href).href,
    pageName: window.location.href,
    pageIDType: 0,
  });

  test("getLinkDetails returns the resolved details even when onBeforeLinkClickSend augments the xdm", async () => {
    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      onBeforeLinkClickSend: (options) => {
        options.xdm.web.webInteraction.name = "augmented name";
        options.data.customField = "test123";
        return true;
      },
    });

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });

    expect(window.___getLinkDetails(link)).toEqual(
      expectedInternalLinkDetails(),
    );
  });

  test("getLinkDetails returns the full internal-link details even when clickCollectionEnabled is false", async () => {
    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: false,
    });

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });

    expect(window.___getLinkDetails(link)).toEqual(
      expectedInternalLinkDetails(),
    );
  });

  test("getLinkDetails returns no link data for a null element", async () => {
    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
    });

    const result = window.___getLinkDetails(null);
    expect(result.linkName).toBeUndefined();
    expect(result.linkRegion).toBeUndefined();
    expect(result.linkType).toBeUndefined();
    expect(result.linkUrl).toBeUndefined();
    expect(result.pageName).toBeUndefined();
  });
});
