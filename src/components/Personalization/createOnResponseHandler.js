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
  storeViews,
  extractRenderableDecisions,
  extractPageWideScopeDecisions,
  executeDecisions,
  showContainers
}) => {
  return ({ renderDecisions, response }) => {
    const unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
    if (!isNonEmptyArray(unprocessedDecisions)) {
      showContainers();
      return { decisions: [] };
    }

    if (renderDecisions) {
      const [renderableDecisions, decisions] = extractRenderableDecisions(
        unprocessedDecisions
      );

      if (isNonEmptyArray(renderableDecisions)) {
        const [
          pageWideScopeDecisions,
          viewDecisions
        ] = extractPageWideScopeDecisions(renderableDecisions);

        if (!isEmptyObject(viewDecisions)) {
          storeViews(viewDecisions);
        }

        executeDecisions(pageWideScopeDecisions);
      }
      showContainers();
      return { decisions };
    }

    return { decisions: unprocessedDecisions };
  };
};
