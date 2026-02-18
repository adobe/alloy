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

import { object, string } from "yup";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import validateDuplicateValue from "./utils/validateDuplicateValue";
import { LIBRARY_TYPE_PREINSTALLED } from "../constants/libraryType";

const DEFAULT_EDGE_DOMAIN_TEMPLATE = "{companyId}.data.adobedc.net";
const LEGACY_DEFAULT_EDGE_DOMAIN = "edge.adobedc.net";

export const createNameValidation = () => {
  return string()
    .required("Please specify a name.")
    .matches(/\D+/, "Please provide a non-numeric name.")
    .test({
      name: "notWindowPropertyName",
      message:
        "Please provide a name that does not conflict with a property already found on the window object.",
      test(value) {
        return !(value in window);
      },
    });
};

const wasPreinstalled = (initInfo) => {
  return initInfo.settings?.librarySettings?.type === LIBRARY_TYPE_PREINSTALLED;
};

export const createUniqueNameTest = () => {
  // eslint-disable-next-line func-names
  return function (instance, testContext) {
    const { path: instancePath, parent: instances } = testContext;
    return validateDuplicateValue({
      createError: this.createError,
      instances,
      instance,
      instancePath,
      key: "name",
      message:
        "Please provide a name unique from those used for other instances.",
    });
  };
};

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
  instanceValidationSchema: object()
    .shape({
      name: createNameValidation(),
      orgId: string().required("Please specify an IMS organization ID."),
      edgeDomain: string().required("Please specify an edge domain."),
    })
    .test("uniqueName", createUniqueNameTest())
    // eslint-disable-next-line func-names
    .test("uniqueOrgId", function (instance, testContext) {
      const { path: instancePath, parent: instances } = testContext;
      return validateDuplicateValue({
        createError: this.createError,
        instances,
        instance,
        instancePath,
        key: "orgId",
        message:
          "Please provide an IMS Organization ID unique from those used for other instances.",
      });
    }),
};
