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

import createEvent from "./createEvent";
import { clone } from "../../utils";

const VIEW_START_EVENT = "viewStart";

const createDataCollector = () => {
  let lifecycle;
  let network;
  let optIn;

  const makeServerCall = event => {
    const payload = network.createPayload();
    payload.addEvent(event);

    // TODO Temporary. Remove when no longer needed.
    payload.mergeMeta({
      gateway: {
        imsOrgID: "53A16ACB5CC1D3760A495C99@AdobeOrg"
      }
    });

    const responsePromise = Promise.resolve()
      .then(() => {
        return lifecycle.onBeforeDataCollection(payload, responsePromise);
      })
      .then(() => {
        return network.sendRequest(payload, payload.expectsResponse);
      })
      .then(response => {
        const data = {
          requestBody: clone(payload)
        };

        if (response) {
          data.responseBody = clone(response);
        }

        return data;
      });
    return responsePromise;
  };

  const createEventHandler = options => {
    const event = createEvent();
    const isViewStart = options.type === VIEW_START_EVENT;

    event.mergeData(options.data);
    event.mergeMeta(options.meta);

    return lifecycle
      .onBeforeEvent(event, options, isViewStart)
      .then(() => makeServerCall(event));
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, network, optIn } = tools);
      }
    },
    commands: {
      event(options) {
        return optIn.whenOptedIn().then(() => createEventHandler(options));
      }
    }
  };
};

createDataCollector.namespace = "DataCollector";

export default createDataCollector;
