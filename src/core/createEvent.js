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

import {
  isEmptyObject,
  deepAssign,
  isNonEmptyArray,
  deduplicateArray
} from "../utils";

const getXdmPropositions = xdm => {
  return xdm &&
    // eslint-disable-next-line no-underscore-dangle
    xdm._experience &&
    // eslint-disable-next-line no-underscore-dangle
    xdm._experience.decisioning &&
    // eslint-disable-next-line no-underscore-dangle
    isNonEmptyArray(xdm._experience.decisioning.propositions)
    ? // eslint-disable-next-line no-underscore-dangle
      xdm._experience.decisioning.propositions
    : [];
};

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
        `${methodName} cannot be called after event is finalized.`
      );
    }
  };

  const event = {
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
      if (xdm) {
        deepAssign(content, { xdm });
      }
    },
    mergeMeta(meta) {
      throwIfEventFinalized("mergeMeta");
      if (meta) {
        deepAssign(content, { meta });
      }
    },
    mergeQuery(query) {
      throwIfEventFinalized("mergeQuery");
      if (query) {
        deepAssign(content, { query });
      }
    },
    documentMayUnload() {
      documentMayUnload = true;
    },
    finalize(onBeforeEventSend) {
      if (isFinalized) {
        return;
      }

      const newPropositions = deduplicateArray(
        [...getXdmPropositions(userXdm), ...getXdmPropositions(content.xdm)],
        (a, b) =>
          a === b ||
          (a.id &&
            b.id &&
            a.id === b.id &&
            a.scope &&
            b.scope &&
            a.scope === b.scope)
      );
      if (userXdm) {
        this.mergeXdm(userXdm);
      }
      if (newPropositions.length > 0) {
        // eslint-disable-next-line no-underscore-dangle
        content.xdm._experience.decisioning.propositions = newPropositions;
      }

      if (userData) {
        content.data = userData;
      }

      // the event should already be considered finalized in case onBeforeEventSend throws an error
      isFinalized = true;

      if (onBeforeEventSend) {
        // assume that the onBeforeEventSend callback will fail (in-case of an error)
        shouldSendEvent = false;

        // this allows the user to replace the xdm and data properties
        // on the object passed to the callback
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
      if (!isFinalized) {
        throw new Error("toJSON called before finalize");
      }

      return content;
    }
  };

  return event;
};
