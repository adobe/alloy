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

import createRequest from "../../core/createRequest";
import createEvent from "../../core/createEvent";

const createDataCollector = ({ config }) => {
  let lifecycle;

  const makeServerCall = events => {
    const request = createRequest(config);
    return request.send(
      events,
      "interact",
      lifecycle.onBeforeRequest,
      lifecycle.onResponse
    );
  };

  const createEventHandler = isViewStart => options => {
    const event = createEvent();
    event.mergeData(options.data);
    lifecycle.onBeforeEvent(event, isViewStart).then(() => {
      makeServerCall([event]);
    });
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle } = tools);
      }
    },
    commands: {
      viewStart: createEventHandler(true),
      event: createEventHandler(false)
    }
  };
};

createDataCollector.namespace = "DataCollector";

createDataCollector.configValidators = {
  collectionUrl: {
    defaultValue: "https://edgegateway.azurewebsites.net"
    // defaultValue: "http://ex-edge.stable-stage.aam-npe.adobeinternal.net/v1"
  },
  device: {
    defaultValue: "UNKNOWN-DEVICE"
  }
};

export default createDataCollector;
