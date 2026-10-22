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
import { noop } from "../../utils/index.js";
import type { GlobalsService } from "../../services/types.js";
import type { Logger } from "../../utils/types.js";

/** An `identity:exchange` payload from Edge. */
export interface IdSync {
  type: string;
  spec: { url: string; hideReferrer: boolean };
}

export interface InjectProcessIdSyncsOptions {
  fireReferrerHideableImage: GlobalsService["fireReferrerHideableImage"];
  logger: Logger;
}

const createResultLogMessage = (idSync: IdSync, success: boolean) => {
  return `ID sync ${success ? "succeeded" : "failed"}: ${idSync.spec.url}`;
};

export default ({
    fireReferrerHideableImage,
    logger,
  }: InjectProcessIdSyncsOptions) =>
  (idSyncs: IdSync[]) => {
    const urlIdSyncs = idSyncs.filter((idSync) => idSync.type === "url");

    if (!urlIdSyncs.length) {
      return Promise.resolve();
    }
    return Promise.all(
      urlIdSyncs.map((idSync) => {
        return fireReferrerHideableImage(idSync.spec)
          .then(() => {
            logger.info(createResultLogMessage(idSync, true));
          })
          .catch(() => {
            // We intentionally do not throw an error if id syncs fail. We
            // consider it a non-critical failure and therefore do not want it to
            // reject the promise handed back to the customer.
            logger.warn(createResultLogMessage(idSync, false));
          });
      }),
    ).then(noop);
  };
