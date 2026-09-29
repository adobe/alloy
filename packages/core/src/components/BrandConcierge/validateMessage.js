/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  anyOf,
  arrayOf,
  boolean,
  objectOf,
  string,
  callback,
} from "../../utils/validation/index.js";
import { noop } from "../../utils/index.js";

const xdmValidator = objectOf({
  interactionId: string(),
  conversationId: string(),
  conversation: objectOf({
    feedback: objectOf({
      classification: string(),
      comment: string(),
      reasons: arrayOf(string()),
    }),
  }),
});

export default ({ options }) => {
  // `surfaces` must be declared on every branch. objectOf passes unknown keys
  // through and anyOf accepts the first passing branch, so a branch without
  // `surfaces` would let an invalid value through.
  const brandConciergeEventValidator = anyOf([
    objectOf({
      message: string().required(),
      xdm: xdmValidator,
      onStreamResponse: callback().default(noop),
      voiceEnabled: boolean().default(false),
      surfaces: arrayOf(string()).uniqueItems(),
    }),
    objectOf({
      xdm: xdmValidator,
      voiceEnabled: boolean().default(false),
      surfaces: arrayOf(string()).uniqueItems(),
    }).required(),
    objectOf({
      data: objectOf({
        type: string().required(),
        payload: objectOf({}),
      }).required(),
      onStreamResponse: callback().default(noop),
      voiceEnabled: boolean().default(false),
      surfaces: arrayOf(string()).uniqueItems(),
    }),
  ]);

  return brandConciergeEventValidator(options);
};
