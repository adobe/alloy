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

import { clone, isEmptyObject, createMerger } from "../utils/index";

export default () => {
  const content = {};
  let userXdm;
  let userData;
  let documentMayUnload = false;
  let lastChanceCallback;

  const event = {
    setUserXdm(value) {
      userXdm = value;
    },
    setUserData(value) {
      userData = value;
    },
    mergeXdm: createMerger(content, "xdm"),
    mergeMeta: createMerger(content, "meta"),
    mergeQuery: createMerger(content, "query"),
    documentMayUnload() {
      documentMayUnload = true;
    },
    getDocumentMayUnload() {
      return documentMayUnload;
    },
    isEmpty() {
      return (
        isEmptyObject(content) &&
        (!userXdm || isEmptyObject(userXdm)) &&
        (!userData || isEmptyObject(userData))
      );
    },
    setLastChanceCallback(value) {
      lastChanceCallback = value;
    },
    getViewName() {
      if (!userXdm || !userXdm.web || !userXdm.web.webPageDetails) {
        return undefined;
      }

      return userXdm.web.webPageDetails.viewName;
    },
    toJSON() {
      if (userXdm) {
        event.mergeXdm(userXdm);
      }
      if (userData) {
        content.data = userData;
      }

      if (lastChanceCallback) {
        // We clone these because if lastChanceCallback throws an error, we don't
        // want any modifications lastChanceCallback made to actually be applied.
        const args = {
          xdm: clone(content.xdm || {}),
          data: clone(content.data || {})
        };
        try {
          lastChanceCallback(args);
          // If onBeforeEventSend throws an exception,
          // we don't want to apply the changes it made
          // so setting content.xdm and content.data is inside this try

          // We only set content.xdm if content.xdm was already set or
          // if content.xdm was empty and the lastChanceCallback added items to it.
          if (content.xdm || !isEmptyObject(args.xdm)) {
            content.xdm = args.xdm;
          }
          if (content.data || !isEmptyObject(args.data)) {
            content.data = args.data;
          }
        } catch (e) {
          // the callback should have already logged the exception
        }
      }

      return content;
    }
  };

  return event;
};
