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

const createAudiences = () => {
  return {
    lifecycle: {
      onBeforeViewStart(payload) {
        console.log("Audiences:::onBeforeViewStart");
        // TODO: Remove; We won't need to request destinations explicitely.
        // This is just for demo currently.
        payload.addQuery({ urlDestinations: true });
      },
      onViewStartResponse(response) {
        console.log("Audiences:::onViewStartResponse");
        const destinations = response.getPayloadByType("activation:push") || [];
        destinations.forEach(dest => console.log(dest.url));
      }
    },
    commands: {}
  };
};

createAudiences.namespace = "Audiences";

export default createAudiences;
