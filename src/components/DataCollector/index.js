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

  const makeServerCall = event => {
    const expectsResponse = event.expectsResponse();
    const { payload, send } = network.newRequest(expectsResponse);
    payload.addEvent(event);
    return send().then(response => {
      const data = {
        requestBody: clone(payload)
      };

      if (response) {
        data.responseBody = clone(response);
      }

      return data;
    });
  };

  const createEventHandler = options => {
    const event = createEvent();
    const isViewStart = options.type === VIEW_START_EVENT;

    event.mergeData(options.data);
    event.mergeMeta(options.meta);

    return lifecycle
      .onBeforeEvent(event, isViewStart)
      .then(() => makeServerCall(event));
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, network } = tools);
      }
    },
    commands: {
      event: createEventHandler
    }
  };
};

createDataCollector.namespace = "DataCollector";

export default createDataCollector;
