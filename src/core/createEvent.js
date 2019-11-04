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

import { clone, isEmptyObject, createMerger } from "../utils";

export default () => {
  const content = {};
  let userXdm;
  let userData;
  let expectsResponse = false;
  let documentUnloading = false;
  let frozen = false;

  const guardFrozen = func => {
    return (...args) => {
      if (!frozen) {
        return func(...args);
      }
      throw Error("This event cannot be modified after it is frozen.");
    };
  };

  const event = {
    setUserXdm: guardFrozen(value => {
      userXdm = value;
    }),
    setUserData: guardFrozen(value => {
      userData = value;
    }),
    mergeXdm: guardFrozen(createMerger(content, "xdm")),
    mergeMeta: guardFrozen(createMerger(content, "meta")),
    mergeQuery: guardFrozen(createMerger(content, "query")),
    documentUnloading: guardFrozen(() => {
      documentUnloading = true;
    }),
    isDocumentUnloading() {
      return documentUnloading;
    },
    expectResponse: guardFrozen(() => {
      expectsResponse = true;
    }),
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
    freeze: guardFrozen(lastChanceCallback => {
      if (userXdm) {
        event.mergeXdm(userXdm);
      }
      if (userData) {
        content.data = userData;
      }
      const xdm = clone(Object(content.xdm));
      try {
        lastChanceCallback(xdm);
        // If onBeforeEventSend throws an exception,
        // we don't want to apply the changes it made
        // so setting content.xdm is inside this try

        // We only set content.xdm if content.xdm was already set or
        // if content.xdm was empty and the lastChanceCallback added items to it.
        if (content.xdm || !isEmptyObject(xdm)) {
          content.xdm = xdm;
        }
      } catch (e) {
        // the callback should have already logged the exeception
      }
      frozen = true;
    }),
    toJSON() {
      return content;
    }
  };

  return event;
};
