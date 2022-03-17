/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import injectExtractOrgIdsFromCookies from "../../../../../src/components/Identity/injectExtractOrgIdsFromCookies";
import { cookieJar } from "../../../../../src/utils";

describe("injectExtractOrIdsFromCookies", () => {
  let allCookies = [];
  let extractOrgIdsFromCookies;
  beforeEach(() => {
    // A copy of the cookies set on alloyio.com
    allCookies = [
      {
        name: "AMCV_5BFE274A5F6980A50A495C08%40AdobeOrg",
        value: "MCMID|13900181084421234122049898624062162656"
      },
      {
        name: "C12412",
        value: "test=C12412"
      },
      {
        name: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_consent",
        value: "general%3Din"
      },
      {
        name: "kndctr_97D1F3F459CE0AD80A495CBE_AdobeOrg_identity",
        value:
          "CiYyMzAxNDk1NDUxNTgxOTM1NzMxMDgzOTk3MDMyMTA4NTczMDQxOFIQCMfR5sv4LxABGAEqA09SMqABx9Hmy%5Fgv8AHH0ebL%2DC8%3D"
      },
      {
        name: "kndctr_97D1F3F459CE0AD80A495CBE_AdobeOrg_consent",
        value: "general%3Din"
      },
      {
        name: "AMCV_97D1F3F459CE0AD80A495CBE%40AdobeOrg",
        value: "MCMID|23014954515819357310839970321085730418"
      },
      {
        name: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity",
        value:
          "CiYxMzkwMDE4MTA4NDQyMTIzNDEyMjA0OTg5ODYyNDA2MjE2MjY1NlIOCPrb%5FYP3LxgBKgNPUjKgAcni2cP5L%5FABkY%5F1nfkv"
      },
      {
        name: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_consent_check",
        value: "1"
      }
    ];
    allCookies.forEach(({ name, value }) => cookieJar.set(name, value));

    extractOrgIdsFromCookies = injectExtractOrgIdsFromCookies({ cookieJar });
  });
  afterEach(() => {
    allCookies.forEach(({ name }) => cookieJar.remove(name));
  });

  it("should extract the org IDs from all the Konductor cookies", () => {
    const orgIds = extractOrgIdsFromCookies();

    expect(orgIds).toEqual([
      "5BFE274A5F6980A50A495C08",
      "97D1F3F459CE0AD80A495CBE"
    ]);
  });
});
