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

export default ({ processPropositions, viewCache, logger }) => {
  return ({ personalizationDetails, onResponse }) => {
    let returnedPropositions;
    let returnedDecisions;
    const viewName = personalizationDetails.getViewName();

    onResponse(() => {
      return {
        propositions: returnedPropositions,
        decisions: returnedDecisions,
      };
    });

    return viewCache.getView(viewName).then((propositions) => {
      let render;
      if (personalizationDetails.isRenderDecisions()) {
        ({ render, returnedPropositions, returnedDecisions } =
          processPropositions(propositions));

        logger.logOnContentRendering({
          status: "rendering-started",
          message: "Rendering propositions started for view scope.",
          logLevel: "info",
          detail: {
            scope: personalizationDetails.getViewName(),
            propositions: propositions.map(proposition => proposition.toJSON())
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
