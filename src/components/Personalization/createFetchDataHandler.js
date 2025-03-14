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
import { groupBy, isNonEmptyArray } from "../../utils/index.js";
import PAGE_WIDE_SCOPE from "../../constants/pageWideScope.js";

const DECISIONS_HANDLE = "personalization:decisions";

export default ({
  logger,
  prehidingStyle,
  showContainers,
  hideContainers,
  mergeQuery,
  processPropositions,
  createProposition,
  notificationHandler,
  consent,
}) => {
  return ({ cacheUpdate, personalizationDetails, event, onResponse }) => {
    const { state, wasSet } = consent.current();
    if (!(state === "out" && wasSet)) {
      if (personalizationDetails.isRenderDecisions()) {
        hideContainers(prehidingStyle);
      } else {
        showContainers();
      }
    }
    mergeQuery(event, personalizationDetails.createQueryDetails());

    // This needs to be called before the response so that future sendEvent calls
    // can know to wait until this request is complete for pending display notifications.
    const handleNotifications = notificationHandler(
      personalizationDetails.isRenderDecisions(),
      personalizationDetails.isSendDisplayEvent(),
      personalizationDetails.getViewName(),
    );

    onResponse(({ response }) => {
      const handles = response.getPayloadsByType(DECISIONS_HANDLE);
      if (!isNonEmptyArray(handles)) {
        logger.logOnContentRendering({
          status: "no-offers",
          message: "No offers were returned.",
          logLevel: "info",
          detail: {
            query: personalizationDetails.createQueryDetails(),
          },
        });
      }
      const propositions = handles.map((handle) => createProposition(handle));
      const {
        page: pagePropositions = [],
        view: viewPropositions = [],
        proposition: nonRenderedPropositions = [],
      } = groupBy(propositions, (p) => p.getScopeType());

      const currentViewPropositions = cacheUpdate.update(viewPropositions);

      let render;
      let returnedPropositions;
      let returnedDecisions;

      if (personalizationDetails.isRenderDecisions()) {
        ({ render, returnedPropositions, returnedDecisions } =
          processPropositions(
            [...pagePropositions, ...currentViewPropositions],
            nonRenderedPropositions,
          ));
        if (isNonEmptyArray(pagePropositions)) {
          logger.logOnContentRendering({
            status: "rendering-started",
            message: "Started rendering propositions for page-wide scope.",
            logLevel: "info",
            detail: {
              scope: PAGE_WIDE_SCOPE,
              propositions: pagePropositions.map((proposition) =>
                proposition.toJSON(),
              ),
            },
          });
        }

        if (isNonEmptyArray(currentViewPropositions)) {
          logger.logOnContentRendering({
            status: "rendering-started",
            message: `Rendering propositions started for view scope - ${personalizationDetails.getViewName()}.`,
            logLevel: "info",
            detail: {
              scope: personalizationDetails.getViewName(),
              propositions: currentViewPropositions.map((proposition) =>
                proposition.toJSON(),
              ),
            },
          });
        }

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
            ...nonRenderedPropositions,
          ],
        ));
      }

      return {
        propositions: returnedPropositions,
        decisions: returnedDecisions,
      };
    });
  };
};
