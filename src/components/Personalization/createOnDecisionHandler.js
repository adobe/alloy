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

export default ({
  processPropositions,
  createProposition,
  collect,
  subscribeMessageFeed
}) => {
  return ({ viewName, renderDecisions, propositions }) => {
    subscribeMessageFeed.refresh(propositions);

    if (!renderDecisions) {
      return Promise.resolve();
    }

    const propositionsToExecute = propositions.map(proposition =>
      createProposition(proposition, true)
    );

    const { render, returnedPropositions } = processPropositions(
      propositionsToExecute
    );

    render().then(decisionsMeta => {
      if (decisionsMeta.length > 0) {
        collect({
          decisionsMeta,
          viewName
        });
      }
    });
    return {
      propositions: returnedPropositions
    };
  };
};
