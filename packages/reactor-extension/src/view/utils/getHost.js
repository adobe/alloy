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

const IMS_HOST_PREFIX_PROD = "ims-na1";
const IMS_HOST_PREFIX_STAGING = "ims-na1-stg1";

/**
 * Returns the associated hostname for the token IMS environment
 * @return {string}
 */
const getHost = ({ imsAccess, productionHost, stagingHost }) => {
  const tokenParts = imsAccess.split(".");
  if (!tokenParts[1]) {
    return productionHost;
  }

  /**
   * attempts to read `as` field from access token and use as environment reference
   * NOTE: assumes production
   */
  let environment;
  try {
    environment = imsAccess
      ? JSON.parse(atob(tokenParts[1])).as
      : IMS_HOST_PREFIX_PROD;
  } catch {
    // catches json parsing issues
    // NOTE: this token is unlikely to work anyway
    environment = IMS_HOST_PREFIX_PROD;
  }

  // return platform host corresponding to IMS environment
  return environment === IMS_HOST_PREFIX_STAGING ? stagingHost : productionHost;
};

export default getHost;
