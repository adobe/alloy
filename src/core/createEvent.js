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

import { isEmptyObject, deepAssign } from "../utils";

export default () => {
  const content = {};
  let userXdm;
  let userData;
  let documentMayUnload = false;
  let isFinalized = false;
  let shouldSendEvent = true;

  const throwIfEventFinalized = methodName => {
    if (isFinalized) {
      throw new Error(
        `${methodName} cannot be called after event is finalized`
      );
    }
  };

  const event = {
    getUserXdm() {
      return userXdm;
    },
    setUserXdm(value) {
      throwIfEventFinalized("setUserXdm");
      userXdm = value;
    },
    setUserData(value) {
      throwIfEventFinalized("setUserData");
      userData = value;
    },
    mergeXdm(xdm) {
      throwIfEventFinalized("mergeXdm");
      deepAssign(content, { xdm });
    },
    mergeMeta(meta) {
      throwIfEventFinalized("mergeMeta");
      deepAssign(content, { meta });
    },
    mergeQuery(query) {
      throwIfEventFinalized("mergeQuery");
      deepAssign(content, { query });
    },
    documentMayUnload() {
      documentMayUnload = true;
    },
    finalize(onBeforeEventSend) {
      if (isFinalized) {
        return;
      }

      if (userXdm) {
        event.mergeXdm(userXdm);
      }

      if (userData) {
        content.data = userData;
      }

      if (onBeforeEventSend) {
        // assume that the onBeforeEventSend callback will fail (in-case of an error)
        shouldSendEvent = false;

        // this allows the user to replace the object passed into the callback
        const tempContent = {
          xdm: content.xdm || {},
          data: content.data || {}
        };

        const result = onBeforeEventSend(tempContent);

        shouldSendEvent = result !== false;

        content.xdm = tempContent.xdm || {};
        content.data = tempContent.data || {};

        if (isEmptyObject(content.xdm)) {
          delete content.xdm;
        }

        if (isEmptyObject(content.data)) {
          delete content.data;
        }
      }

      isFinalized = true;
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
    shouldSend() {
      return shouldSendEvent;
    },
    getViewName() {
      if (!userXdm || !userXdm.web || !userXdm.web.webPageDetails) {
        return undefined;
      }

      return userXdm.web.webPageDetails.viewName;
    },
    toJSON() {
      if (!isFinalized) this.finalize();
      return content;
    }
  };

  return event;
};
