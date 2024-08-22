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
import { Identity } from "../../utils/identityProtobuf.js";
import { getNamespacedCookieName } from "../../utils/index.js";

const base64ToBytes = (base64) => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

export default ({ config, cookieJar }) => {
  const { orgId } = config;
  const kndctrCookieName = getNamespacedCookieName(orgId, "kndctr");
  /**
   * Returns the ECID from the kndctr cookie.
   * @returns {string|null}
   */
  return () => {
    const cookie = cookieJar.get(kndctrCookieName);
    if (!cookie) {
      return null;
    }
    const decodedCookie = decodeURIComponent(cookie)
      .replace(/_/g, "/")
      .replace(/-/g, "+");
    // cookie is a base64 encoded byte representation of a Identity protobuf message
    // and we need to get it to a Uint8Array in order to decode it

    const cookieBytes = base64ToBytes(decodedCookie);
    const message = Identity.decode(cookieBytes);
    return message.ecid;
  };
};
