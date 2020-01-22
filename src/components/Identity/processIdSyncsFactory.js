/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const createResultLogMessage = (idSync, success) => {
  return `ID sync ${success ? "succeeded" : "failed"}: ${idSync.spec.url}`;
};

export default ({ fireReferrerHideableImage, logger, consent }) => idSyncs => {
  const urlIdSyncs = idSyncs.filter(idSync => idSync.type === "url");

  if (!urlIdSyncs.length) {
    return Promise.resolve();
  }

  return consent.awaitConsent().then(() => {
    return Promise.all(
      urlIdSyncs.map(idSync => {
        return fireReferrerHideableImage(idSync.spec)
          .then(() => {
            logger.log(createResultLogMessage(idSync, true));
          })
          .catch(() => {
            // We intentionally do not throw an error if id syncs fail. We
            // consider it a non-critical failure and therefore do not want it to
            // reject the promise handed back to the customer.
            logger.error(createResultLogMessage(idSync, false));
          });
      })
    );
  });
};
