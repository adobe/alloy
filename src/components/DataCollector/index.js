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

import createRequest from "./createRequest";

const createDataCollector = ({ config }) => {
  let lifecycle;

  const makeServerCall = (endpoint, beforeHook, afterHook) => event => {
    const request = createRequest(config);
    return request.send(event, endpoint, beforeHook, afterHook);
  };

  const makeHookCall = hook => (...args) => {
    return lifecycle[hook](...args);
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle } = tools);
      }
    },
    commands: {
      viewStart: makeServerCall(
        "interact",
        makeHookCall("onBeforeViewStart"),
        makeHookCall("onViewStartResponse")
      ),
      event: makeServerCall(
        "interact",
        makeHookCall("onBeforeEvent"),
        makeHookCall("onEventResponse")
      )
    }
  };
};

createDataCollector.namespace = "DataCollector";

export default createDataCollector;
