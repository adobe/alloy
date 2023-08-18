import { REDIRECT_EXECUTION_ERROR } from "../constants/loggerMessage";

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
  handleChain,
  collect,
  executeRedirect,
  logger,
  showContainers
}) => propositions => {
  for (let i = 0; i < propositions.length; i += 1) {
    const proposition = propositions[i];
    handleChain(proposition);
    const redirectUrl = proposition.getRedirectUrl();
    if (redirectUrl) {
      const displayNotificationPropositions = [];
      proposition.addToNotifications(displayNotificationPropositions);
      // no return value because we are redirecting. i.e. the sendEvent promise will
      // never resolve anyways so no need to generate the return value.
      return collect({ decisionsMeta: displayNotificationPropositions })
        .then(() => {
          executeRedirect(redirectUrl);
          // This code should never be reached because we are redirecting, but in case
          // it does we return an empty array of notifications to match the return type.
          return [];
        })
        .catch(() => {
          showContainers();
          logger.warn(REDIRECT_EXECUTION_ERROR);
        });
    }
  }

  return Promise.all(
    propositions.map(proposition => proposition.render(logger))
  ).then(notifications => {
    return notifications.filter(notification => notification);
  });
};
