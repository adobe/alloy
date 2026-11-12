/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { getBy } from "@tanstack/react-form";
import { all, matches, required, rule, shape } from "../forms/validation";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import { LIBRARY_TYPE_PREINSTALLED } from "../constants/libraryType";

const DEFAULT_EDGE_DOMAIN_TEMPLATE = "{companyId}.data.adobedc.net";
const LEGACY_DEFAULT_EDGE_DOMAIN = "edge.adobedc.net";

const wasPreinstalled = (initInfo) => {
  return initInfo.settings?.librarySettings?.type === LIBRARY_TYPE_PREINSTALLED;
};

// Only instances after the first one with a value are flagged as duplicates.
const uniqueAmongInstances = (key, message) =>
  rule((value, ctx) => {
    const instances = getBy(ctx.root, ctx.path.slice(0, -2));
    return (
      instances.findIndex((instance) => instance[key] === value) ===
      ctx.path.at(-2)
    );
  }, message);

export const nameSchema = all(
  required("Please specify a name."),
  matches(/\D+/, "Please provide a non-numeric name."),
  rule(
    (value) => !(value in window),
    "Please provide a name that does not conflict with a property already found on the window object.",
  ),
  uniqueAmongInstances(
    "name",
    "Please provide a name unique from those used for other instances.",
  ),
);

export const bridge = {
  getInstanceDefaults: ({ initInfo, existingInstances = [] }) => {
    // Generate a unique instance name
    let name = "alloy";
    const existingNames = existingInstances.map((instance) => instance.name);

    if (existingNames.includes(name)) {
      let counter = 2;
      while (existingNames.includes(`${name}${counter}`)) {
        counter += 1;
      }
      name = `${name}${counter}`;
    }

    return {
      name,
      persistedName: undefined,
      orgId: initInfo.company.orgId,
      edgeDomain: initInfo.company.tenantId
        ? DEFAULT_EDGE_DOMAIN_TEMPLATE.replace(
            "{companyId}",
            initInfo.company.tenantId,
          )
        : LEGACY_DEFAULT_EDGE_DOMAIN,
    };
  },
  getInitialInstanceValues: ({ initInfo, instanceSettings }) => {
    const instanceValues = {};

    if (!wasPreinstalled(initInfo) && !instanceSettings.edgeDomain) {
      instanceSettings.edgeDomain = LEGACY_DEFAULT_EDGE_DOMAIN;
    }

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: instanceSettings,
      defaultsObj: bridge.getInstanceDefaults({ initInfo }),
      keys: ["name", "orgId", "edgeDomain"],
    });

    instanceValues.persistedName = instanceValues.name;

    return instanceValues;
  },
  getInstanceSettings: ({ initInfo, instanceValues }) => {
    const { name } = instanceValues;
    const instanceSettings = {
      name,
    };

    const defaults = bridge.getInstanceDefaults({ initInfo });
    defaults.edgeDomain = LEGACY_DEFAULT_EDGE_DOMAIN;

    copyPropertiesIfValueDifferentThanDefault({
      toObj: instanceSettings,
      fromObj: instanceValues,
      defaultsObj: defaults,
      keys: ["orgId", "edgeDomain"],
    });

    return instanceSettings;
  },
  instanceValidationSchema: shape({
    name: nameSchema,
    orgId: all(
      required("Please specify an IMS organization ID."),
      uniqueAmongInstances(
        "orgId",
        "Please provide an IMS Organization ID unique from those used for other instances.",
      ),
    ),
    edgeDomain: required("Please specify an edge domain."),
  }),
};
