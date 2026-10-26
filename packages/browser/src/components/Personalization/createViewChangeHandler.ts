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

import type { Event } from "@adobe/alloy-core/core/types.js";
import type {
  Logger,
  OnRequestFailure,
  OnResponse,
  PersonalizationDetails,
  ProcessPropositions,
  ProcessPropositionsResult,
  PropositionPayload,
  ViewCache,
} from "./types.js";

export default ({
  processPropositions,
  viewCache,
  logger,
}: {
  processPropositions: ProcessPropositions;
  viewCache: ViewCache;
  logger: Logger;
}) => {
  return ({
    personalizationDetails,
    onResponse,
  }: {
    personalizationDetails: PersonalizationDetails;
    event?: Event;
    onResponse: OnResponse;
    onRequestFailure?: OnRequestFailure;
  }) => {
    let returnedPropositions: PropositionPayload[] | undefined;
    let returnedDecisions: PropositionPayload[] | undefined;
    // This handler only runs when the event has a view name.
    const viewName = personalizationDetails.getViewName() as string;

    onResponse(() => {
      return {
        propositions: returnedPropositions,
        decisions: returnedDecisions,
      };
    });

    return viewCache.getView(viewName).then((propositions) => {
      let render: ProcessPropositionsResult["render"];
      if (personalizationDetails.isRenderDecisions()) {
        ({ render, returnedPropositions, returnedDecisions } =
          processPropositions(propositions));

        logger.logOnContentRendering({
          status: "rendering-started",
          message: `Started rendering propositions for view scope - ${viewName}.`,
          logLevel: "info",
          detail: {
            scope: viewName,
            propositions: propositions.map((proposition) =>
              proposition.toJSON(),
            ),
          },
        });

        return render();
      }
      ({ returnedPropositions, returnedDecisions } = processPropositions(
        [],
        propositions,
      ));
      return [];
    });
  };
};
