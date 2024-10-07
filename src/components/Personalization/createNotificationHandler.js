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
import { defer } from "../../utils/index.js";
import { SUPPRESS } from "../../constants/eventType.js";

export default (collect, renderedPropositions) => {
  return (isRenderDecisions, isSendDisplayEvent, viewName) => {
    if (!isRenderDecisions) {
      // If we aren't rendering anything, then we don't need to sendDisplayEvents.
      return () => undefined;
    }

    if (!isSendDisplayEvent) {
      const renderedPropositionsDeferred = defer();
      renderedPropositions.concat(renderedPropositionsDeferred.promise);
      return renderedPropositionsDeferred.resolve;
    }

    return (suppressedPropositions, decisionsMeta) => {
      if (decisionsMeta.length > 0) {
        collect({
          decisionsMeta,
          viewName,
        });
      }

      if (suppressedPropositions && suppressedPropositions.length > 0) {
        const suppressedMeta = suppressedPropositions.map(
          ({ id, scope, scopeDetails }) => ({
            id,
            scope,
            scopeDetails,
          }),
        );

        collect({
          decisionsMeta: suppressedMeta,
          eventType: SUPPRESS,
          viewName,
        });
      }
    };
  };
};
