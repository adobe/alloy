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

  const event = {
    getUserXdm() {
      return userXdm;
    },
    setUserXdm(value) {
      if (isFinalized) {
        throw new Error("userXdm cannot be set after event is finalized");
      }
      userXdm = value;
    },
    setUserData(value) {
      if (isFinalized) {
        throw new Error("userData cannot be set after event is finalized");
      }

      userData = value;
    },
    mergeXdm(xdm) {
      if (isFinalized) {
        throw new Error("mergeXdm cannot be called after event is finalized");
      }

      deepAssign(content, { xdm });
    },
    mergeMeta(meta) {
      if (isFinalized) {
        throw new Error("mergeMeta cannot be called after event is finalized");
      }

      deepAssign(content, { meta });
    },
    mergeQuery(query) {
      if (isFinalized) {
        throw new Error("mergeQuery cannot be called after event is finalized");
      }

      deepAssign(content, { query });
    },
    documentMayUnload() {
      documentMayUnload = true;
    },
    finalize(onBeforeEventSend) {
      if (isFinalized) return;

      if (userXdm) {
        event.mergeXdm(userXdm);
      }

      if (userData) {
        content.data = userData;
      }

      if (onBeforeEventSend) {
        const xdm = content.xdm || {};
        const data = content.data || {};
        onBeforeEventSend({
          xdm,
          data
        });

        if (Object.keys(xdm).length) {
          content.xdm = xdm;
        }

        if (Object.keys(data).length) {
          content.data = data;
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
    getViewName() {
      if (!userXdm || !userXdm.web || !userXdm.web.webPageDetails) {
        return undefined;
      }

      return userXdm.web.webPageDetails.viewName;
    },
    toJSON() {
      return content;
    }
  };

  return event;
};
