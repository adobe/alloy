/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

describe("Config overrides", () => {
  test("should not include 'global' config overrides in payload if the service is disabled in the command options", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const config = structuredClone(alloyConfig);
    await alloy("configure", {
      ...config,
      edgeConfigOverrides: {
        com_adobe_analytics: {
          reportSuites: ["reportSuite1"],
        },
      },
    });

    await alloy("sendEvent", {
      edgeConfigOverrides: {
        com_adobe_analytics: {
          enabled: false,
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call.request?.body?.meta?.configOverrides).toEqual({
      com_adobe_analytics: {
        enabled: false,
      },
    });
  });

  test("should allow you to disable a service in the base config, but enable it in a send event call", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const config = structuredClone(alloyConfig);
    await alloy("configure", {
      ...config,
      edgeConfigOverrides: {
        com_adobe_analytics: {
          enabled: false,
        },
      },
    });

    await alloy("sendEvent", {
      edgeConfigOverrides: {
        com_adobe_analytics: {
          enabled: true,
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call.request?.body?.meta?.configOverrides).toBeUndefined();
  });

  test("should allow you to disable a service in the base config, but enable it in a send event call with extra parameters", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const config = structuredClone(alloyConfig);
    await alloy("configure", {
      ...config,
      edgeConfigOverrides: {
        com_adobe_analytics: {
          enabled: false,
        },
      },
    });

    await alloy("sendEvent", {
      edgeConfigOverrides: {
        com_adobe_analytics: {
          enabled: true,
          reportSuites: ["reportSuite1"],
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call.request?.body?.meta?.configOverrides).toEqual({
      com_adobe_analytics: {
        reportSuites: ["reportSuite1"],
      },
    });
  });
});
