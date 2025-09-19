/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** @import { Logger } from '../../../core/types.js' */

import {
  openIndexedDb,
  getFromIndexedDbStore,
  putToIndexedDbStore,
} from "../../../utils/index.js";

import { DB_NAME, DB_VERSION, STORE_NAME, INDEX_KEY } from "./constants.js";

/**
 * @param {Object} data
 * @param {Logger} logger
 *
 * @returns {Promise<void>}
 */
export default async function saveToIndexedDB(data, logger) {
  try {
    const db = await openIndexedDb(
      DB_NAME,
      DB_VERSION,
      (/** @type {IDBDatabase} */ db) => {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    );

    const existingConfigData = await getFromIndexedDbStore(
      db,
      STORE_NAME,
      INDEX_KEY,
    );

    const updatedConfigData = {
      ...(existingConfigData || {}),
      ...data,
      id: INDEX_KEY,
      timestamp: Date.now(),
    };

    await putToIndexedDbStore(db, STORE_NAME, updatedConfigData);
    db.close();

    logger.info(
      "Successfully saved web SDK config to IndexedDB",
      updatedConfigData,
    );
  } catch (error) {
    logger.error("Failed to save config to IndexedDB", { error });
  }
}
