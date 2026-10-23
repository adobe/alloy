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

import type { Override } from "../../../utils/request/types.js";

const URL_REGEX = /^([^?#]*)(\??[^#]*)(#?.*)$/;

const getSeparator = (queryString: string) => {
  if (queryString === "") {
    return "?";
  }
  if (queryString === "?") {
    return "";
  }
  return "&";
};

export interface InjectAppendIdentityToUrlOptions {
  dateProvider: () => Date;
  orgId: string;
  /** Passed by the component but not read. */
  globalConfigOverrides?: Override;
}

export default ({ dateProvider, orgId }: InjectAppendIdentityToUrlOptions) =>
  (ecid: string, url: string) => {
    const ts = Math.round(dateProvider().getTime() / 1000);
    const adobemc = encodeURIComponent(
      `TS=${ts}|MCMID=${ecid}|MCORGID=${encodeURIComponent(orgId)}`,
    );
    // The regex matches any single-line string; a URL with a line break throws here, as before.
    const [, location, queryString, fragment] = url.match(URL_REGEX)!;
    const separator = getSeparator(queryString);
    return `${location}${queryString}${separator}adobe_mc=${adobemc}${fragment}`;
  };
