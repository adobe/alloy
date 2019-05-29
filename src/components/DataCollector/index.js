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

import createEvent from "../../core/createEvent";

const VIEW_START_EVENT = "viewStart";

const createDataCollector = () => {
  let lifecycle;
  let network;

  const makeServerCall = (events, beacon) => {
    const { payload, send } = network.newRequest(beacon);
    events.forEach(event => payload.addEvent(event));
    send();
  };

  const createEventHandler = options => {
    const { beacon } = options;
    const event = createEvent();
    const isViewStart = options.type === VIEW_START_EVENT;

    // Attempt to use Beacon transport.
    // If the `beacon` config is set, we use it ONLY if not `viewStart`
    // because `viewStart` events are expected to return a response.

    // TODO Validate `beacon`.
    // TODO Might have to move somewhere closer to Network Manager.
    // TODO Consider adding `beacon` as a config instead of
    // passing it on each command. This way `Alloy` will always
    // use beacon when possible.

    const shouldUseBeacon = isViewStart || !beacon ? false : beacon;

    event.mergeData(options.data);
    lifecycle.onBeforeEvent(event, isViewStart).then(() => {
      makeServerCall([event], shouldUseBeacon);
    });
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
