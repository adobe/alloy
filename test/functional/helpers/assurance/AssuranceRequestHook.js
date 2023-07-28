/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { RequestHook, t } from "testcafe";

const ASSERTION_DELAY = 200;
const ASSERTION_TIMEOUT = 5000;
const delay = () => {
  return new Promise(resolve => setTimeout(resolve, ASSERTION_DELAY));
};

const createRequest = (requestLogs, fetchMore) => {
  return {
    find: async predicate => {
      let i = 0;
      for (i = 0; i < requestLogs.length; i += 1) {
        if (predicate(requestLogs[i])) {
          return requestLogs[i];
        }
      }
      const expirationTime = new Date().getTime() + ASSERTION_TIMEOUT;
      while (new Date().getTime() < expirationTime) {
        // eslint-disable-next-line no-await-in-loop
        await fetchMore();
        for (; i < requestLogs.length; i += 1) {
          if (predicate(requestLogs[i])) {
            return requestLogs[i];
          }
        }
        // eslint-disable-next-line no-await-in-loop
        await delay();
      }
      t.expect().ok(
        "Assurance logs did not contain an event matching the predicate after 5 seconds."
      );
      return undefined;
    },
    debug() {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(requestLogs, null, 2));
    }
  };
};

export default class AssuranceRequestHook extends RequestHook {
  constructor(assuranceToken, events) {
    super();
    this.assuranceToken = assuranceToken;
    this.events = events;
    this.eventsByRequestId = {};
    this.requests = [];
  }

  onRequest(e) {
    const url = new URL(e.requestOptions.url);
    const requestId = url.searchParams.get("requestId");
    if (requestId) {
      e.requestOptions.headers[
        "X-Adobe-AEP-Validation-Token"
      ] = this.assuranceToken;
      const requestLogs = [];
      this.eventsByRequestId[requestId] = requestLogs;
      this.requests.push(createRequest(requestLogs, this.fetchMore.bind(this)));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onResponse() {}

  async fetchMore() {
    // eslint-disable-next-line no-await-in-loop
    while (await this.events.advance()) {
      const event = this.events.current();
      const { payload: { attributes: { requestId } = {} } = {} } = event;
      if (requestId && this.eventsByRequestId[requestId]) {
        this.eventsByRequestId[requestId].push(event);
      }
    }
  }
}
