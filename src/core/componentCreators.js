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

// This is the only place where core is allowed to import from components.
// This makes sure that each component could be removed without breaking the library

/* eslint-disable import/no-restricted-paths */

import createDataCollector from "../components/DataCollector/index.js";

/* @skipwhen ENV.alloy_activitycollector === false */
import createActivityCollector from "../components/ActivityCollector/index.js";

import createIdentity from "../components/Identity/index.js";

/* @skipwhen ENV.alloy_audiences === false */
import createAudiences from "../components/Audiences/index.js";

/* @skipwhen ENV.alloy_personalization === false */
import createPersonalization from "../components/Personalization/index.js";

import createContext from "../components/Context/index.js";
import createPrivacy from "../components/Privacy/index.js";

/* @skipwhen ENV.alloy_eventmerge === false */
import createEventMerge from "../components/EventMerge/index.js";

import createLibraryInfo from "../components/LibraryInfo/index.js";

/* @skipwhen ENV.alloy_decisioningengine === false */
import createDecisioningEngine from "../components/DecisioningEngine/index.js";

/* @skipwhen ENV.alloy_machinelearning === false */
import createMachineLearning from "../components/MachineLearning/index.js";

// TODO: Register the Components here statically for now. They might be registered differently.
// TODO: Figure out how sub-components will be made available/registered

export default [
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
];
