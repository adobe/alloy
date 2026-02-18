/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import copyPropertiesIfValueDifferentThanDefault from "../../../../../src/view/configuration/utils/copyPropertiesIfValueDifferentThanDefault";

describe("copyPropertiesIfValueDifferentThanDefault", () => {
  it("should copy only the keys specified", () => {
    const toObj = {};
    const fromObj = {
      a: "foo",
      b: "bar",
      c: "",
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: "",
    };
    const keys = ["a", "b"];
    copyPropertiesIfValueDifferentThanDefault({
      toObj,
      fromObj,
      defaultsObj,
      keys,
    });
    expect(Object.keys(toObj)).toEqual(keys);
  });

  it("should copy only the keys that have different values from the defaults", () => {
    const toObj = {};
    const fromObj = {
      a: "foo",
      b: "bar",
      c: "",
    };
    const defaultsObj = {
      a: "",
      b: "bar",
      c: "",
    };
    const keys = ["a", "b", "c"];
    copyPropertiesIfValueDifferentThanDefault({
      toObj,
      fromObj,
      defaultsObj,
      keys,
    });
    expect(toObj).toEqual({ a: "foo" });
  });

  it("should copy support nested objects", () => {
    const toObj = {};
    const fromObj = {
      a: "foo",
      b: "",
      c: {
        d: {
          e: "baz",
          f: null,
        },
      },
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: {
        d: {
          e: "",
          f: null,
        },
      },
    };
    const keys = ["a", "b", "c"];
    copyPropertiesIfValueDifferentThanDefault({
      toObj,
      fromObj,
      defaultsObj,
      keys,
    });
    expect(toObj).toEqual({
      a: "foo",
      c: {
        d: {
          e: "baz",
        },
      },
    });
  });

  it("should work with the default extension configuration", () => {
    const options = {
      toObj: {},
      fromObj: {
        name: "alloy",
        orgId: "ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg",
        edgeDomain: "edge.adobedc.net",
        edgeConfigInputMethod: "freeform",
        edgeConfigFreeformInputMethod: {
          edgeConfigId: "",
          stagingEdgeConfigId: "",
          developmentEdgeConfigId: "",
        },
        edgeConfigSelectInputMethod: {
          productionEnvironment: {
            datastreamId: "",
            sandbox: "",
          },
          stagingEnvironment: {
            datastreamId: "",
            sandbox: "",
          },
          developmentEnvironment: {
            datastreamId: "",
            sandbox: "",
          },
        },
        defaultConsent: "in",
        idMigrationEnabled: true,
        thirdPartyCookiesEnabled: true,
        prehidingStyle: "",
        targetMigrationEnabled: false,
        onBeforeEventSend: "",
        clickCollectionEnabled: true,
        downloadLinkQualifier:
          "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$",
        contextGranularity: "all",
        context: ["web", "device", "environment", "placeContext"],
        globalOverridesEnabled: true,
        edgeConfigOverrides: {
          com_adobe_experience_platform: {
            datasets: {
              event: {
                datasetId: "",
              },
              profile: {
                datasetId: "",
              },
            },
          },
          com_adobe_analytics: {
            reportSuites: [""],
          },
          com_adobe_identity: {
            idSyncContainerId: "",
          },
          com_adobe_target: {
            propertyToken: "",
          },
        },
        edgeBasePath: "ee",
      },
      defaultsObj: {
        globalOverridesEnabled: true,
        edgeConfigOverrides: {
          com_adobe_experience_platform: {
            datasets: {
              event: {
                datasetId: "",
              },
              profile: {
                datasetId: "",
              },
            },
          },
          com_adobe_analytics: {
            reportSuites: [""],
          },
          com_adobe_identity: {
            idSyncContainerId: "",
          },
          com_adobe_target: {
            propertyToken: "",
          },
        },
      },
      keys: ["name", "globalOverridesEnabled", "edgeConfigOverrides"],
    };
    copyPropertiesIfValueDifferentThanDefault(options);
    expect(options.toObj).toEqual({ name: "alloy" });
  });

  it("should work with arrays", () => {
    const options = {
      toObj: {},
      fromObj: {
        foo: "bar",
        bar: ["baz"],
      },
      defaultsObj: {
        foo: "",
        bar: [""],
      },
      keys: ["bar"],
    };
    copyPropertiesIfValueDifferentThanDefault(options);
    expect(options.toObj).toEqual({
      bar: ["baz"],
    });
  });
});
