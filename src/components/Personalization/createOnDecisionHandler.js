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
  notificationHandler,
  subscribeMessageFeed
}) => {
  return ({ renderDecisions, propositions, event, personalization = {} }) => {
    subscribeMessageFeed.refresh(propositions);
    if (!renderDecisions) {
      return Promise.resolve();
    }

    const { sendDisplayEvent = true } = personalization;
    const viewName = event ? event.getViewName() : undefined;

    const propositionsToExecute = propositions.map(proposition =>
      createProposition(proposition, true)
    );

    const { render, returnedPropositions } = processPropositions(
      propositionsToExecute
    );

    const handleNotifications = notificationHandler(
      renderDecisions,
      sendDisplayEvent,
      viewName
    );
    render().then(handleNotifications);

    return Promise.resolve({
      propositions: returnedPropositions
    });
  };
};
