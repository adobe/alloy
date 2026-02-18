/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import { bridge } from "../../../../src/view/configuration/basicSectionBridge";

describe("basicSection bridge", () => {
  describe("getInstanceDefaults", () => {
    it("returns tenant-specific edgeDomain when tenantId is provided", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };

      const defaults = bridge.getInstanceDefaults({ initInfo });

      expect(defaults).toEqual({
        name: "alloy",
        persistedName: undefined,
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      });
    });

    it("returns legacy edgeDomain when tenantId is not provided", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
        },
      };

      const defaults = bridge.getInstanceDefaults({ initInfo });

      expect(defaults).toEqual({
        name: "alloy",
        persistedName: undefined,
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "edge.adobedc.net",
      });
    });

    it("returns legacy edgeDomain when tenantId is null", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: null,
        },
      };

      const defaults = bridge.getInstanceDefaults({ initInfo });

      expect(defaults).toEqual({
        name: "alloy",
        persistedName: undefined,
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "edge.adobedc.net",
      });
    });
  });

  describe("getInitialInstanceValues", () => {
    it("uses saved edgeDomain when it exists", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceSettings = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "custom.example.com",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });

      expect(values).toEqual({
        name: "myinstance",
        persistedName: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "custom.example.com",
      });
    });

    it("falls back to legacy edgeDomain when not saved (existing instance)", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceSettings = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });

      expect(values).toEqual({
        name: "myinstance",
        persistedName: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "edge.adobedc.net",
      });
    });

    it("uses saved tenant-specific edgeDomain", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceSettings = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });

      expect(values).toEqual({
        name: "myinstance",
        persistedName: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      });
    });
  });

  describe("getInstanceSettings", () => {
    it("saves tenant-specific edgeDomain even when it matches the default", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceValues = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      };

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues,
      });

      expect(settings).toEqual({
        name: "myinstance",
        edgeDomain: "mytenant.data.adobedc.net",
      });
    });

    it("does not save legacy edgeDomain when it matches the default", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
        },
      };
      const instanceValues = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "edge.adobedc.net",
      };

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues,
      });

      expect(settings).toEqual({
        name: "myinstance",
      });
    });

    it("saves custom edgeDomain when different from default", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceValues = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "custom.example.com",
      };

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues,
      });

      expect(settings).toEqual({
        name: "myinstance",
        edgeDomain: "custom.example.com",
      });
    });

    it("saves orgId when different from default", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceValues = {
        name: "myinstance",
        orgId: "DIFFERENT_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      };

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues,
      });

      expect(settings).toEqual({
        name: "myinstance",
        orgId: "DIFFERENT_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      });
    });

    it("does not save orgId when it matches the default", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceValues = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "mytenant.data.adobedc.net",
      };

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues,
      });

      expect(settings).toEqual({
        name: "myinstance",
        edgeDomain: "mytenant.data.adobedc.net",
      });
    });

    it("does not save legacy domain when user manually sets it (matches effective default)", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceValues = {
        name: "myinstance",
        orgId: "TEST_ORG@AdobeOrg",
        edgeDomain: "edge.adobedc.net",
      };

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues,
      });

      expect(settings).toEqual({
        name: "myinstance",
      });
    });

    it("autofills tenant-specific edgeDomain when no existing settings are provided", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };

      const defaults = bridge.getInstanceDefaults({ initInfo });
      expect(defaults.edgeDomain).toBe("mytenant.data.adobedc.net");

      const settings = bridge.getInstanceSettings({
        initInfo,
        instanceValues: defaults,
      });
      expect(settings.edgeDomain).toBe("mytenant.data.adobedc.net");
    });

    it("autofills legacy edgeDomain when loading an existing instance with no saved value", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceSettings = {
        name: "oldinstance",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });
      expect(values.edgeDomain).toBe("edge.adobedc.net");

      const savedSettings = bridge.getInstanceSettings({
        initInfo,
        instanceValues: values,
      });
      expect(savedSettings.edgeDomain).toBeUndefined();
      expect(savedSettings).toEqual({
        name: "oldinstance",
      });
    });

    it("does not overwrite saved custom edgeDomain", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceSettings = {
        name: "custominstance",
        edgeDomain: "custom.example.com",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });
      expect(values.edgeDomain).toBe("custom.example.com");

      const savedSettings = bridge.getInstanceSettings({
        initInfo,
        instanceValues: values,
      });
      expect(savedSettings.edgeDomain).toBe("custom.example.com");
    });

    it("does not overwrite saved tenant-specific edgeDomain", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
      };
      const instanceSettings = {
        name: "newinstance",
        edgeDomain: "mytenant.data.adobedc.net",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });
      expect(values.edgeDomain).toBe("mytenant.data.adobedc.net");

      const savedSettings = bridge.getInstanceSettings({
        initInfo,
        instanceValues: values,
      });
      expect(savedSettings.edgeDomain).toBe("mytenant.data.adobedc.net");
    });

    it("autofills tenant-specific edgeDomain when switching to preinstalled library from self-hosted", () => {
      const initInfo = {
        company: {
          orgId: "TEST_ORG@AdobeOrg",
          tenantId: "mytenant",
        },
        settings: {
          librarySettings: {
            type: "preinstalled",
          },
        },
      };
      const instanceSettings = {
        name: "myinstance",
      };

      const values = bridge.getInitialInstanceValues({
        initInfo,
        instanceSettings,
      });
      expect(values.edgeDomain).toBe("mytenant.data.adobedc.net");

      const savedSettings = bridge.getInstanceSettings({
        initInfo,
        instanceValues: values,
      });
      expect(savedSettings.edgeDomain).toBe("mytenant.data.adobedc.net");
    });
  });
});
