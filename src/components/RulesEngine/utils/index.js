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

export { default as generateEventHash } from "./generateEventHash.js";
export { default as getExpirationDate } from "./getExpirationDate.js";
export { default as createEventPruner } from "./createEventPruner.js";
export { default as hasExperienceData } from "./hasExperienceData.js";
export { getActivityId, getDecisionProvider } from "./getPropositionData.js";
export {
  createRestoreStorage,
  createSaveStorage,
  createInMemoryStorage,
  clearLocalStorage,
} from "./storage.js";
