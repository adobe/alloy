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
import isNonEmptyArray from "../../utils/isNonEmptyArray";
import { isEmptyObject } from "../../utils";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  viewCache,
  extractRenderableDecisions,
  extractPageWideScopeDecisions,
  executeDecisions,
  onViewChangeHandler,
  showContainers
}) => {
  return ({ personalization, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
    const viewName = personalization.getViewName();
    if (!isNonEmptyArray(unprocessedDecisions)) {
      showContainers();
      return { decisions: [] };
    }

    const {
      renderableDecisions,
      formBasedDecisions
    } = extractRenderableDecisions(unprocessedDecisions);
    const { pageWideDecisions, viewDecisions } = extractPageWideScopeDecisions(
      renderableDecisions
    );

    if (!isEmptyObject(viewDecisions)) {
      viewCache.storeViews(viewDecisions);
    }
    if (personalization.isRenderDecisions()) {
      executeDecisions(pageWideDecisions);
      if (viewName) {
        onViewChangeHandler({ viewName });
      }
      showContainers();
      return { decisions: formBasedDecisions };
    }
    const decisionsToBeReturned = [...pageWideDecisions, ...formBasedDecisions];

    if (viewName && viewDecisions[viewName]) {
      decisionsToBeReturned.push(...viewDecisions[viewName]);
    }

    return {
      decisions: decisionsToBeReturned
    };
  };
};
