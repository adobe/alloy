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
import type { Response } from "../../core/types.js";

export interface IdentityResultPayload {
  id: string;
  namespace?: { code?: string };
}

export default (response: Pick<Response, "getPayloadsByType">) => {
  // Edge returns `identity:result` payloads in this shape.
  const identityResultPayloads = response.getPayloadsByType(
    "identity:result",
  ) as IdentityResultPayload[];
  return identityResultPayloads.reduce<Record<string, string>>(
    (acc, payload) => {
      if (payload.namespace && payload.namespace.code) {
        acc[payload.namespace.code] = payload.id;
      }
      return acc;
    },
    {},
  );
};
