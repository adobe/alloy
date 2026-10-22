/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { isNonEmptyArray } from "../utils/index.js";
import type { RequestPayload } from "../utils/request/types.js";
import type { CookieAttributes, CookieService } from "../services/types.js";
import type { Response } from "./types.js";

const STATE_STORE_HANDLE_TYPE = "state:store";

interface StateStoreItem {
  key: string;
  value: string;
  maxAge?: number;
  attrs?: { SameSite?: string };
}

export interface CookieTransferState {
  domain: string;
  cookiesEnabled: boolean;
  entries?: { key: string; value: string }[];
}

export interface CookieTransfer {
  cookiesToPayload: (
    payload: Pick<RequestPayload, "mergeState">,
    endpointDomain: string,
    extraCookieNames?: string[],
  ) => void;
  responseToCookies: (response: Pick<Response, "getPayloadsByType">) => void;
}

export interface CreateCookieTransferOptions {
  cookieJar: Pick<CookieService, "getAll" | "set">;
  shouldTransferCookie: (name: string) => boolean | undefined;
  apexDomain: string;
  dateProvider: () => Date;
}

export default ({
  cookieJar,
  shouldTransferCookie,
  apexDomain,
  dateProvider,
}: CreateCookieTransferOptions): CookieTransfer => {
  return {
    /**
     * When sending to a third-party endpoint, the endpoint won't be able to
     * access first-party cookies, therefore we transfer cookies into
     * the request body so they can be read by the server.
     */
    cookiesToPayload(
      payload: Pick<RequestPayload, "mergeState">,
      endpointDomain: string,
      extraCookieNames: string[] = [],
    ) {
      // localhost is a special case where the apexDomain is ""
      // We want to treat localhost as a third-party domain.
      const isEndpointFirstParty =
        apexDomain !== "" && endpointDomain.endsWith(apexDomain);
      const state: CookieTransferState = {
        domain: apexDomain,
        cookiesEnabled: true,
      };

      // If the endpoint is first-party, there's no need to transfer cookies
      // to the payload since they'll be automatically passed through cookie
      // headers.
      if (!isEndpointFirstParty || isNonEmptyArray(extraCookieNames)) {
        const cookies = cookieJar.getAll();
        const entriesByKey = new Map<string, { key: string; value: string }>();
        const addEntry = (key: string) => {
          if (cookies[key] !== undefined && !entriesByKey.has(key)) {
            entriesByKey.set(key, { key, value: cookies[key] });
          }
        };
        if (!isEndpointFirstParty) {
          Object.keys(cookies).filter(shouldTransferCookie).forEach(addEntry);
        }
        if (isNonEmptyArray(extraCookieNames)) {
          extraCookieNames.forEach(addEntry);
        }
        if (entriesByKey.size) {
          state.entries = [...entriesByKey.values()];
        }
      }

      payload.mergeState(state);
    },
    /**
     * When receiving from a third-party endpoint, the endpoint won't be able to
     * write first-party cookies, therefore we write first-party cookies
     * as directed in the response body.
     */
    responseToCookies(response: Pick<Response, "getPayloadsByType">) {
      // state:store payloads are the cookie entries written by the Edge Network.
      (
        response.getPayloadsByType(STATE_STORE_HANDLE_TYPE) as StateStoreItem[]
      ).forEach((stateItem) => {
        const options: CookieAttributes = { domain: apexDomain };

        const sameSite =
          stateItem.attrs &&
          stateItem.attrs.SameSite &&
          stateItem.attrs.SameSite.toLowerCase();

        if (stateItem.maxAge !== undefined) {
          // cookieJar expects "expires" as a date object
          options.expires = new Date(
            dateProvider().getTime() + stateItem.maxAge * 1000,
          );
        }
        if (sameSite !== undefined) {
          // Passed through from the server without validation, as before.
          options.sameSite = sameSite as CookieAttributes["sameSite"];
        }
        // When sameSite is set to none, the secure flag must be set.
        // Experience edge will not set the secure flag in these cases.
        if (sameSite === "none") {
          options.secure = true;
        }

        cookieJar.set(stateItem.key, stateItem.value, options);
      });
    },
  };
};
