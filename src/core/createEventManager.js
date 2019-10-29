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

import { clone, noop } from "../utils";

export default ({ createEvent, optIn, lifecycle, network, config }) => {
  const { imsOrgId } = config;

  return {
    createEvent,
    sendEvent(event, options = {}) {
      const { isViewStart = false, applyUserProvidedData = noop } = options;

      const payload = network.createPayload();
      payload.addEvent(event);
      payload.mergeMeta({
        gateway: {
          imsOrgId
        }
      });

      return lifecycle
        .onBeforeEvent({
          event,
          isViewStart
        })
        .then(() => {
          applyUserProvidedData(event);
          return optIn.whenOptedIn();
        })
        .then(() => {
          return lifecycle.onBeforeDataCollection({ payload });
        })
        .then(() => {
          return network.sendRequest(payload, {
            expectsResponse: payload.expectsResponse,
            documentUnloading: event.isDocumentUnloading()
          });
        })
        .then(response => {
          const returnData = {
            requestBody: clone(payload)
          };

          if (response) {
            returnData.responseBody = clone(response);
          }

          return returnData;
        });
    }
  };
};
