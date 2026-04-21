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
/**
 * Extract the edge config ids from the object, which could be either the
 * instance settings as stored by Launch or the form state as stored by Formik.
 *
 * @param {Object} instanceSettings
 * @returns {{
 *  developmentEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * },
 * stagingEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * },
 * productionEnvironment: {
 *   datastreamId: string,
 *   sandbox?: string
 * }}}
 */
const getEdgeConfigIds = (instanceSettings) => {
  if (!instanceSettings) {
    return {
      developmentEnvironment: {},
      stagingEnvironment: {},
      productionEnvironment: {},
    };
  }
  if (instanceSettings.edgeConfigInputMethod === "freeform") {
    return {
      developmentEnvironment: {
        datastreamId:
          instanceSettings.edgeConfigFreeformInputMethod
            .developmentEdgeConfigId,
      },
      stagingEnvironment: {
        datastreamId:
          instanceSettings.edgeConfigFreeformInputMethod.stagingEdgeConfigId,
      },
      productionEnvironment: {
        datastreamId:
          instanceSettings.edgeConfigFreeformInputMethod.edgeConfigId,
      },
    };
  }
  if (instanceSettings.edgeConfigInputMethod === "select") {
    return instanceSettings.edgeConfigSelectInputMethod;
  }
  return {
    developmentEnvironment: {
      datastreamId: instanceSettings.developmentEdgeConfigId,
      sandbox: instanceSettings.developmentSandbox,
    },
    stagingEnvironment: {
      datastreamId: instanceSettings.stagingEdgeConfigId,
      sandbox: instanceSettings.stagingSandbox,
    },
    productionEnvironment: {
      datastreamId: instanceSettings.edgeConfigId,
      sandbox: instanceSettings.sandbox,
    },
  };
};
export default getEdgeConfigIds;
