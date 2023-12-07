/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export default () => {
  const propositionCache = {};

  const cacheKey = (scope, eventToken) => `${scope}-${eventToken}`;

  const storePropositions = aepResponse => {
    const { propositions = [] } = aepResponse;

    propositions.forEach(proposition => {
      const { scope, scopeDetails = {} } = proposition;
      const { characteristics = {} } = scopeDetails;
      const { eventToken } = characteristics;

      if (scope && eventToken) {
        propositionCache[cacheKey(scope, eventToken)] = proposition;
      }
    });

    return aepResponse;
  };

  const getProposition = (scope, eventToken) => {
    return propositionCache[cacheKey(scope, eventToken)];
  };

  return {
    storePropositions,
    getProposition
  };
};
