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
import { http, HttpResponse } from "msw";
import { createInstance } from "@adobe/alloy";
import {
  test,
  testWithoutAlloy,
  expect,
  describe,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";

const instances = [
  {
    name: "alloy",
    datastreamId: "11111111-1111-4111-8111-111111111111",
    orgId: "111111111111111111111111@AdobeOrg",
    ecid: "11111111111111111111111111111111111111",
    identityState: "identity-state-one",
  },
  {
    name: "instance2",
    datastreamId: "22222222-2222-4222-8222-222222222222",
    orgId: "222222222222222222222222@AdobeOrg",
    ecid: "22222222222222222222222222222222222222",
    identityState: "identity-state-two",
  },
];

const getIdentityEntry = (call) =>
  call.request.body.meta.state.entries?.find(({ key }) =>
    key.endsWith("_identity"),
  );

afterEach(() => {
  cleanAlloy();
  delete window.instance2;
  instances.forEach(({ orgId }) => {
    document.cookie = `kndctr_${orgId.replace("@", "_")}_identity=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
});

describe("Install SDK", () => {
  test("C2560 - window.alloy is a callable function after the SDK loads", async ({
    alloy,
  }) => {
    expect(typeof window.alloy).toBe("function");
    expect(alloy).toBeDefined();
  });

  testWithoutAlloy(
    "C2579 - separate ECIDs are used for multiple SDK instances",
    async ({ worker, networkRecorder }) => {
      worker.use(
        http.post(
          /https:\/\/edge\.adobedc\.net\/ee\/v1\/interact/,
          ({ request }) => {
            const datastreamId = new URL(request.url).searchParams.get(
              "configId",
            );
            const instance = instances.find(
              (candidate) => candidate.datastreamId === datastreamId,
            );

            if (!instance) {
              throw new Error(`Unexpected datastream ID: ${datastreamId}`);
            }

            return HttpResponse.json({
              requestId: `${instance.name}-request-id`,
              handle: [
                {
                  type: "identity:result",
                  payload: [
                    {
                      id: instance.ecid,
                      namespace: { code: "ECID" },
                    },
                  ],
                },
                {
                  type: "state:store",
                  payload: [
                    {
                      key: `kndctr_${instance.orgId.replace("@", "_")}_identity`,
                      value: instance.identityState,
                      maxAge: 34128000,
                    },
                  ],
                },
              ],
            });
          },
        ),
      );

      await setupAlloy({ instanceNames: instances.map(({ name }) => name) });

      await Promise.all(
        instances.map((instance) =>
          window[instance.name]("configure", {
            ...alloyConfig,
            datastreamId: instance.datastreamId,
            orgId: instance.orgId,
          }),
        ),
      );
      await Promise.all(instances.map(({ name }) => window[name]("sendEvent")));
      await Promise.all(instances.map(({ name }) => window[name]("sendEvent")));

      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
        minCalls: 4,
      });

      const identities = await Promise.all(
        instances.map(({ name }) =>
          window[name]("getIdentity", { namespaces: ["ECID"] }),
        ),
      );

      instances.forEach((instance, index) => {
        const instanceCalls = calls.filter(
          ({ request }) =>
            new URL(request.url).searchParams.get("configId") ===
            instance.datastreamId,
        );
        const otherInstance = instances.find(
          ({ name }) => name !== instance.name,
        );

        expect(instanceCalls).toHaveLength(2);
        expect(getIdentityEntry(instanceCalls[0])).toBeUndefined();
        expect(getIdentityEntry(instanceCalls[1])).toEqual({
          key: `kndctr_${instance.orgId.replace("@", "_")}_identity`,
          value: instance.identityState,
        });
        expect(getIdentityEntry(instanceCalls[1]).value).not.toBe(
          otherInstance.identityState,
        );

        expect(identities[index]).toMatchObject({
          identity: { ECID: instance.ecid },
        });
      });
    },
  );

  testWithoutAlloy(
    "C1338399 - SDK can be initialized from the NPM entry point using createInstance",
    async ({ worker, networkRecorder }) => {
      worker.use(sendEventHandler);
      const alloy = createInstance({ name: "npmLibraryAlloy" });

      await alloy("configure", alloyConfig);
      await alloy("sendEvent");

      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
      expect(calls).toHaveLength(1);
      expect(new URL(calls[0].request.url).searchParams.get("configId")).toBe(
        alloyConfig.datastreamId,
      );
    },
  );
});
