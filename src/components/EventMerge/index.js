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

import { uuid } from "../../utils";
import { callback } from "../../utils/validation";

const generateEventMergeIdResult = () => {
  return {
    eventMergeId: uuid()
  };
};

const createEventMerge = ({ config }) => {
  // #if _REACTOR
  // This is a way for the Event Merge ID data element in the Reactor extension
  // to get an event merge ID synchronously since data elements are required
  // to be synchronous.
  config.reactorRegisterCreateEventMergeId(generateEventMergeIdResult);
  // #endif

  return {
    commands: {
      createEventMergeId: {
        run: generateEventMergeIdResult
      }
    }
  };
};

createEventMerge.namespace = "EventMerge";
createEventMerge.configValidators = {};

// #if _REACTOR
// Not much need to validate since we are our own consumer.
createEventMerge.configValidators.reactorRegisterCreateEventMergeId = callback().default(
  () => {}
);
// #endif

export default createEventMerge;
