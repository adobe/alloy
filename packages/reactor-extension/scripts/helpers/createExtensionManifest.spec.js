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

import Ajv from "ajv-draft-04";
import addAJVFormats from "ajv-formats";
import { describe, expect, test } from "vitest";

import createExtensionManifest from "./createExtensionManifest.mjs";

/**
 * Validate extension settings against the configuration schema in the
 * manifest, the way Tags does when a user saves the extension configuration.
 * @param {object} settings
 * @returns {import("ajv").ErrorObject[] | null} The errors, or null if valid.
 */
const validateConfigurationSettings = (settings) => {
  const manifest = createExtensionManifest({ version: "0.0.0" });
  const ajv = new Ajv({ schemaId: "auto", strict: false });
  addAJVFormats(ajv);
  ajv.validate(manifest.configuration.schema, settings);
  return ajv.errors;
};

describe("createExtensionManifest configuration schema", () => {
  test("accepts serverSideTimestamp in an instance's context", () => {
    const errors = validateConfigurationSettings({
      instances: [
        {
          name: "alloy",
          edgeConfigId: "PR123",
          context: ["web", "device", "serverSideTimestamp"],
        },
      ],
    });

    expect(errors).toBeNull();
  });

  test("rejects an unknown context value", () => {
    const errors = validateConfigurationSettings({
      instances: [
        {
          name: "alloy",
          edgeConfigId: "PR123",
          context: ["web", "notAContext"],
        },
      ],
    });

    expect(errors).not.toBeNull();
  });
});
