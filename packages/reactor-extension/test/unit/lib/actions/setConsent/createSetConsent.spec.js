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

import { describe, it, expect, vi } from "vitest";
import createSetConsent from "../../../../../src/lib/actions/setConsent/createSetConsent";

describe("Set Consent", () => {
  ["in", "out"].forEach((generalConsent) => {
    it(`executes setConsent command with "${generalConsent}" general consent`, () => {
      const promiseReturnedFromInstance = Promise.resolve();
      const instance = vi.fn().mockReturnValue(promiseReturnedFromInstance);
      const instanceManager = {
        getInstance: vi.fn().mockReturnValue(instance),
      };
      const getConfigOverrides = vi.fn();
      const action = createSetConsent({ instanceManager, getConfigOverrides });

      const settings = {
        instanceName: "myinstance",
        general: generalConsent,
        consent: [
          {
            standard: "Adobe",
            version: "2.0",
            value: {
              general: generalConsent,
            },
          },
        ],
      };

      const promiseReturnedFromAction = action(settings);

      expect(instanceManager.getInstance).toHaveBeenCalledWith("myinstance");
      expect(instance).toHaveBeenCalledWith("setConsent", {
        consent: [
          {
            standard: "Adobe",
            version: "2.0",
            value: {
              general: generalConsent,
            },
          },
        ],
        edgeConfigOverrides: undefined,
      });

      expect(promiseReturnedFromAction).toBe(promiseReturnedFromInstance);
    });
  });

  [
    ["", "empty string"],
    [null, "null"],
    [undefined, "undefined"],
  ].forEach(([identityMap, description]) => {
    it(`doesn't pass identityMap when it is ${description}`, () => {
      const instance = vi.fn();
      const instanceManager = { getInstance: () => instance };
      const getConfigOverrides = vi.fn();
      const action = createSetConsent({ instanceManager, getConfigOverrides });

      action({
        instanceName: "myinstance",
        general: "in",
        identityMap,
        consent: [
          {
            standard: "Adobe",
            version: "2.0",
            value: {
              general: "in",
            },
          },
        ],
      });

      expect(instance).toHaveBeenCalledWith("setConsent", {
        consent: [
          {
            standard: "Adobe",
            version: "2.0",
            value: {
              general: "in",
            },
          },
        ],
        edgeConfigOverrides: undefined,
      });
    });
  });

  it("throws an error when no matching instance found", () => {
    const getConfigOverrides = vi.fn();
    const instanceManager = {
      getInstance: vi.fn().mockReturnValue(undefined),
    };
    const action = createSetConsent({ instanceManager, getConfigOverrides });

    expect(() => {
      action({
        instanceName: "myinstance",
        general: "in",
        consent: [
          {
            standard: "Adobe",
            version: "2.0",
            value: {
              general: "in",
            },
          },
        ],
      });
    }).toThrow(
      'Failed to set consent for instance "myinstance". No matching instance was configured with this name.',
    );
  });

  it("passes edgeConfigOverrides when it is defined", () => {
    const instance = vi.fn();
    const edgeConfigOverrides = {
      com_adobe_experience_platform: {
        datasets: {
          event: {
            datasetId: "6335faf30f5a161c0b4b1444",
          },
        },
      },
      com_adobe_analytics: {
        reportSuites: ["unifiedjsqeonly2"],
      },
      com_adobe_identity: {
        idSyncContainerId: 30793,
      },
      com_adobe_target: {
        propertyToken: "a15d008c-5ec0-cabd-7fc7-ab54d56f01e8",
      },
    };
    const getConfigOverrides = vi.fn().mockReturnValue(edgeConfigOverrides);
    const instanceManager = { getInstance: () => instance };
    const action = createSetConsent({ instanceManager, getConfigOverrides });

    action({
      instanceName: "myinstance",
      general: "in",
      consent: [
        {
          standard: "Adobe",
          version: "2.0",
          value: {
            general: "in",
          },
        },
      ],
      edgeConfigOverrides: {
        development: edgeConfigOverrides,
      },
    });

    expect(instance).toHaveBeenCalledWith("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "2.0",
          value: {
            general: "in",
          },
        },
      ],
      edgeConfigOverrides: {
        com_adobe_experience_platform: {
          datasets: {
            event: {
              datasetId: "6335faf30f5a161c0b4b1444",
            },
          },
        },
        com_adobe_analytics: {
          reportSuites: ["unifiedjsqeonly2"],
        },
        com_adobe_identity: {
          idSyncContainerId: 30793,
        },
        com_adobe_target: {
          propertyToken: "a15d008c-5ec0-cabd-7fc7-ab54d56f01e8",
        },
      },
    });
  });
});
