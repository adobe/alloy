/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { RequestHook } from "testcafe";

/**
 * Useful for determining if requests were sent sequentially
 * (a response from a request is received before the next request
 * is sent).
 */
export default class FailOnceHook extends RequestHook {
  constructor(...args) {
    super(...args);
    this.numRequests = 0;
  }

  async onRequest() {
    this.numRequests += 1;
  }

  async onResponse() {
    this.outstandingRequest = false;
  }

  haveRequestsBeenSequential() {
    return this.allRequestsSequential;
  }

  getNumRequests() {
    return this.numRequests;
  }
}
