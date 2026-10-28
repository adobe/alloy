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

import {
  test,
  describe,
  expect,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  createAdvertisingConfig,
  findClickThroughCall,
  findViewThroughCalls,
  getRequestBody,
} from "../../helpers/advertising.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";
import waitFor from "../../helpers/utils/waitFor.js";

const getAdvertisingCookieName = () =>
  `kndctr_${alloyConfig.orgId.replace("@", "_")}_advertising`;

const getAdvertisingCookie = () => {
  const name = getAdvertisingCookieName();
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=").slice(1).join("=") : null;
};

const setAdvertisingCookie = (value) => {
  document.cookie = `${getAdvertisingCookieName()}=${value}; path=/`;
};

const clearAdvertisingCookie = () => {
  document.cookie = `${getAdvertisingCookieName()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

const hasAdvertisingScriptsOrFrames = () =>
  Array.from(document.querySelectorAll("iframe, script")).some((node) =>
    /everesttech\.net|everestjs\.net|id5|ramp/i.test(node.src || ""),
  );

describe("Advertising - enabled: false", () => {
  beforeEach(() => {
    clearAdvertisingCookie();
  });

  afterEach(() => {
    clearAdvertisingCookie();
  });

  test("sends no conversions, adds no advertising data, and writes no cookies", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      url.searchParams.set("s_kwcid", "AL!disabled_kwcid");
      url.searchParams.set("ef_id", "disabled_efid");
      applyUrl(url);

      await alloy("configure", {
        ...alloyConfig,
        ...createAdvertisingConfig({
          enabled: false,
          id5PartnerId: "test-partner",
          rampIdJSPath: "/ramp.js",
        }),
      });

      await alloy("sendEvent", {
        xdm: { eventType: "web.webpagedetails.pageViews" },
        advertising: { handleAdvertisingData: "auto" },
      });

      // Give a fire-and-forget conversion time to go out if one were going to.
      await waitFor(500);

      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
      expect(calls.length).toBe(1);
      expect(findClickThroughCall(calls)).toBeUndefined();
      expect(findViewThroughCalls(calls)).toEqual([]);
      const event = getRequestBody(calls[0]).events[0];
      expect(event.query?.advertising).toBeUndefined();
      expect(event.xdm?._experience?.adcloud).toBeUndefined();

      expect(getAdvertisingCookie()).toBeNull();
      expect(hasAdvertisingScriptsOrFrames()).toBe(false);
    });
  });

  test("leaves an existing advertising cookie unchanged", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const cookieValue = encodeURIComponent(
      JSON.stringify({
        surferId: "sample-surfer-id-12345",
        lastConversionTime: Date.now(),
      }),
    );
    setAdvertisingCookie(cookieValue);

    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig({ enabled: false }),
    });
    await alloy("sendEvent", {
      advertising: { handleAdvertisingData: "auto" },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(getRequestBody(call).events[0].query?.advertising).toBeUndefined();
    expect(getAdvertisingCookie()).toBe(cookieValue);
  });

  test("still sends a click-through conversion when enabled is true", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      url.searchParams.set("s_kwcid", "AL!enabled_kwcid");
      applyUrl(url);

      await alloy("configure", {
        ...alloyConfig,
        ...createAdvertisingConfig({ enabled: true }),
      });
      await alloy("sendEvent");

      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
      expect(findClickThroughCall(calls)).toBeTruthy();
    });
  });

  test("rejects a string value", async ({ alloy }) => {
    await expect(
      alloy("configure", {
        ...alloyConfig,
        advertising: { enabled: "false" },
      }),
    ).rejects.toThrow(/advertising\.enabled/);
  });
});
