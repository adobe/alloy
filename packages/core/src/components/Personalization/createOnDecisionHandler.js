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

import { MESSAGE_IN_APP } from "../../constants/schema.js";

// When multiple In-App messages propositions are returned, we need to show only one
// of them (the one with lowest rank). This function keep track of the number of
// times it was called. It returns false for the first proposition that contains
// In-App messages items, true afterwards.
const createShouldSuppressDisplay = () => {
  let count = 0;
  return (proposition) => {
    const { items = [] } = proposition;

    if (!items.some((item) => item.schema === MESSAGE_IN_APP)) {
      return false;
    }
    count += 1;

    return count > 1;
  };
};

export default ({
  processPropositions,
  createProposition,
  notificationHandler,
}) => {
  return ({ renderDecisions, propositions, event, personalization = {} }) => {
    if (!renderDecisions) {
      return Promise.resolve();
    }

    const { sendDisplayEvent = true } = personalization;
    const viewName = event ? event.getViewName() : undefined;

    const shouldSuppressDisplay = createShouldSuppressDisplay();

    const propositionsToExecute = propositions.map((proposition) =>
      createProposition(proposition, true, shouldSuppressDisplay(proposition)),
    );

    const { render, returnedPropositions } = processPropositions(
      propositionsToExecute,
    );

    const handleNotifications = notificationHandler(
      renderDecisions,
      sendDisplayEvent,
      viewName,
    );

    const propositionsById = propositionsToExecute.reduce(
      (tot, proposition) => {
        tot[proposition.getId()] = proposition;
        return tot;
      },
      {},
    );

    render().then((decisionsMeta) => {
      const decisionsMetaDisplay = decisionsMeta.filter(
        (meta) => !propositionsById[meta.id].shouldSuppressDisplay(),
      );

      const decisionsMetaSuppressed = decisionsMeta.filter((meta) =>
        propositionsById[meta.id].shouldSuppressDisplay(),
      );

      handleNotifications(decisionsMetaDisplay, decisionsMetaSuppressed);
    });

    return Promise.resolve({
      propositions: returnedPropositions,
    });
  };
};
