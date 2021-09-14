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

import { isNonEmptyArray } from "../../utils";

export default ({ processDestinations }) => {
  const processPushDestinations = ({ response }) => {
    const destinations = response.getPayloadsByType("activation:push");
    return processDestinations(destinations);
  };

  // IMPORTANT: We are breaking our own interface here, and not returning
  // a handle if it's not available in the response. We are doing this because
  // a small group of customers need the edge destinations for a beta program.
  // This behavior along with the `destinations` variable name will most probably
  // change in the near future.
  const retrievePullDestinations = ({ response }) => {
    const destinations = response.getPayloadsByType("activation:pull");
    const resolveValue = isNonEmptyArray(destinations)
      ? { destinations }
      : undefined;
    return resolveValue;
  };

  return ({ response }) => {
    return processPushDestinations({ response }).then(() =>
      retrievePullDestinations({ response })
    );
  };
};
