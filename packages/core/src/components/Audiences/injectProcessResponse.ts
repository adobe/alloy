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

import type { Response } from "../../core/types.js";
import type {
  Destination,
  ProcessDestinations,
} from "./injectProcessDestinations.js";

export interface ProcessResponseOptions {
  processDestinations: ProcessDestinations;
}

export default ({ processDestinations }: ProcessResponseOptions) => {
  return ({ response }: { response: Pick<Response, "getPayloadsByType"> }) => {
    // Edge returns destination payloads under these types; shape not validated.
    const pushDestinations =
      response.getPayloadsByType<Destination>("activation:push");
    // fire and forget
    processDestinations(pushDestinations);
    return {
      destinations: response.getPayloadsByType("activation:pull"),
    };
  };
};
