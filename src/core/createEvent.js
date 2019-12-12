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

import { clone, isEmptyObject, createMerger, noop } from "../utils";

export default () => {
  const content = {};
  let userXdm;
  let userData;
  let expectsResponse = false;
  let documentUnloading = false;
  let lastChanceCallback = noop;

  const event = {
    set userXdm(value) {
      userXdm = value;
    },
    set userData(value) {
      userData = value;
    },
    mergeXdm: createMerger(content, "xdm"),
    mergeMeta: createMerger(content, "meta"),
    mergeQuery: createMerger(content, "query"),
    documentUnloading() {
      documentUnloading = true;
    },
    get isDocumentUnloading() {
      return documentUnloading;
    },
    expectResponse() {
      expectsResponse = true;
    },
    get expectsResponse() {
      return expectsResponse;
    },
    isEmpty() {
      return (
        isEmptyObject(content) &&
        (!userXdm || isEmptyObject(userXdm)) &&
        (!userData || isEmptyObject(userData))
      );
    },
    set lastChanceCallback(value) {
      lastChanceCallback = value;
    },
    validate() {
      const warnings = [];
      if (event.isEmpty()) {
        warnings.push("No event xdm or event data specified.");
      }
      if (
        (content.xdm && !content.xdm.eventType) ||
        (userXdm && !userXdm.eventType)
      ) {
        warnings.push("No type or xdm.eventType specified.");
      }
      return warnings;
    },
    toJSON() {
      if (userXdm) {
        event.mergeXdm(userXdm);
      }
      if (userData) {
        content.data = userData;
      }
      const xdm = clone(Object(content.xdm));
      const data = clone(Object(content.data));
      try {
        lastChanceCallback({ xdm, data });
        // If onBeforeEventSend throws an exception,
        // we don't want to apply the changes it made
        // so setting content.xdm and content.data is inside this try

        // We only set content.xdm if content.xdm was already set or
        // if content.xdm was empty and the lastChanceCallback added items to it.
        if (content.xdm || !isEmptyObject(xdm)) {
          content.xdm = xdm;
        }
        if (content.data || !isEmptyObject(data)) {
          content.data = data;
        }
      } catch (e) {
        // the callback should have already logged the exeception
      }

      return content;
    }
  };

  return event;
};
