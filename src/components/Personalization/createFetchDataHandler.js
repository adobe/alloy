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
import { defer, groupBy } from "../../utils";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  prehidingStyle,
  showContainers,
  hideContainers,
  mergeQuery,
  collect,
  processPropositions,
  createProposition,
  renderedPropositions
}) => {
  return ({ cacheUpdate, personalizationDetails, event, onResponse }) => {
    if (personalizationDetails.isRenderDecisions()) {
      hideContainers(prehidingStyle);
    } else {
      showContainers();
    }
    mergeQuery(event, personalizationDetails.createQueryDetails());

    let handleNotifications;
    if (personalizationDetails.isSendDisplayEvent()) {
      handleNotifications = decisionsMeta => {
        if (decisionsMeta.length > 0) {
          collect({
            decisionsMeta,
            viewName: personalizationDetails.getViewName()
          });
        }
      };
    } else {
      const renderedPropositionsDeferred = defer();
      renderedPropositions.concat(renderedPropositionsDeferred.promise);
      handleNotifications = renderedPropositionsDeferred.resolve;
    }

    onResponse(({ response }) => {
      const handles = response.getPayloadsByType(DECISIONS_HANDLE);
      const propositions = handles.map(handle => createProposition(handle));
      const {
        page: pagePropositions = [],
        view: viewPropositions = [],
        proposition: nonRenderedPropositions = []
      } = groupBy(propositions, p => p.getScopeType());

      const currentViewPropositions = cacheUpdate.update(viewPropositions);

      let render;
      let returnedPropositions;
      let returnedDecisions;

      if (personalizationDetails.isRenderDecisions()) {
        ({
          render,
          returnedPropositions,
          returnedDecisions
        } = processPropositions(
          [...pagePropositions, ...currentViewPropositions],
          nonRenderedPropositions
        ));
        render().then(handleNotifications);

        // Render could take a long time especially if one of the renders
        // is waiting for html to appear on the page. We show the containers
        // immediately, and whatever renders quickly will not have flicker.
        showContainers();
      } else {
        ({ returnedPropositions, returnedDecisions } = processPropositions(
          [],
          [
            ...pagePropositions,
            ...currentViewPropositions,
            ...nonRenderedPropositions
          ]
        ));
      }

      return {
        propositions: returnedPropositions,
        decisions: returnedDecisions
      };
    });
  };
};
