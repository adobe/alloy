/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import injectSetDomainForInitialIdentityPayload from "../../../../../src/components/Identity/injectSetDomainForInitialIdentityPayload.js";

describe("Identity::injectSetDomainForInitialIdentityPayload", () => {
  let request;
  let thirdPartyCookiesEnabled;
  let areThirdPartyCookiesSupportedByDefault;
  let setDomainForInitialIdentityPayload;
  const build = () => {
    setDomainForInitialIdentityPayload =
      injectSetDomainForInitialIdentityPayload({
        thirdPartyCookiesEnabled,
        areThirdPartyCookiesSupportedByDefault,
      });
  };
  beforeEach(() => {
    request = {
      setUseIdThirdPartyDomain: vi.fn(),
    };
    areThirdPartyCookiesSupportedByDefault = vi.fn();
  });
  it("does not use third-party domain if third-party cookies are disabled", () => {
    thirdPartyCookiesEnabled = false;
    areThirdPartyCookiesSupportedByDefault.mockReturnValue(true);
    build();
    setDomainForInitialIdentityPayload(request);
    expect(request.setUseIdThirdPartyDomain).not.toHaveBeenCalled();
  });
  it("does not use third-party domain if third-party cookies are not supported by the browser by default", () => {
    thirdPartyCookiesEnabled = true;
    areThirdPartyCookiesSupportedByDefault.mockReturnValue(false);
    build();
    setDomainForInitialIdentityPayload(request);
    expect(areThirdPartyCookiesSupportedByDefault).toHaveBeenCalledWith();
    expect(request.setUseIdThirdPartyDomain).not.toHaveBeenCalled();
  });
  it("uses third-party domain if third-party cookies are enabled and supported by the browser by default", () => {
    thirdPartyCookiesEnabled = true;
    areThirdPartyCookiesSupportedByDefault.mockReturnValue(true);
    build();
    setDomainForInitialIdentityPayload(request);
    expect(areThirdPartyCookiesSupportedByDefault).toHaveBeenCalledWith();
    expect(request.setUseIdThirdPartyDomain).toHaveBeenCalled();
  });
});
