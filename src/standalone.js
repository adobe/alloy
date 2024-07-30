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

// This file is used by rollup to create the browser version that is uploaded to cdn

import core from "./core/index.js";
import {
  createDataCollector,
  createActivityCollector,
  createIdentity,
  createAudiences,
  createPersonalization,
  createContext,
  createPrivacy,
  createEventMerge,
  createLibraryInfo,
  createMachineLearning,
  createDecisioningEngine,
  createLegacyMediaAnalytics,
  createStreamingMedia,
} from "./index.js";

core([
  createActivityCollector,
  createAudiences,
  createPersonalization,
  createContext,
  createPrivacy,
  createEventMerge,
  createMachineLearning,
  createDecisioningEngine,
  createLegacyMediaAnalytics,
  createStreamingMedia,

  // Currently, the following components
  // cannot be removed from a build.
  createDataCollector,
  createIdentity,
  createLibraryInfo,
]);
