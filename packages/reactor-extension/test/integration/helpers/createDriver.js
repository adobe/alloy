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
import { expect } from "vitest";

const identity = (x) => x;

export default function createDriver(registration, readyPromise) {
  return {
    init: (initInfo) => {
      registration.init({
        company: { orgId: "1234@AdobeOrg" },
        tokens: { imsAccess: "IMS_ACCESS" },
        propertySettings: { id: "PR1234" },
        ...initInfo,
      });
      return readyPromise;
    },
    expectSettings: (getProperty = identity) => {
      return expect.poll(
        async () => {
          const settings = await registration.getSettings();
          return getProperty(settings);
        },
        { timeout: 2000 },
      );
    },
    expectValidate: () => {
      return expect.poll(
        async () => {
          const valid = await registration.validate();
          return valid;
        },
        { timeout: 2000 },
      );
    },
  };
}
