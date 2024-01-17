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

import createDataCollector from "../components/DataCollector";
/* @skipwhen ENV.alloy_activitycollector === false */
import createActivityCollector from "../components/ActivityCollector";
import createIdentity from "../components/Identity";
/* @skipwhen ENV.alloy_audiences === false */
import createAudiences from "../components/Audiences";
/* @skipwhen ENV.alloy_personalization === false */
import createPersonalization from "../components/Personalization";
import createContext from "../components/Context";
import createPrivacy from "../components/Privacy";
/* @skipwhen ENV.alloy_eventmerge === false */
import createEventMerge from "../components/EventMerge";
import createLibraryInfo from "../components/LibraryInfo";
/* @skipwhen ENV.alloy_decisioningengine === false */
import createDecisioningEngine from "../components/DecisioningEngine";
/* @skipwhen ENV.alloy_machinelearning === false */
import createMachineLearning from "../components/MachineLearning";

const REQUIRED_COMPONENTS = [
  createContext,
  createPrivacy,
  createIdentity,
  createDataCollector,
  createLibraryInfo
];

const OPTIONAL_COMPONENTS = [
  typeof createActivityCollector !== "undefined"
    ? createActivityCollector
    : () => {},
  typeof createAudiences !== "undefined" ? createAudiences : () => {},
  typeof createPersonalization !== "undefined"
    ? createPersonalization
    : () => {},
  typeof createEventMerge !== "undefined" ? createEventMerge : () => {},
  typeof createMachineLearning !== "undefined"
    ? createMachineLearning
    : () => {},
  typeof createDecisioningEngine !== "undefined"
    ? createDecisioningEngine
    : () => {}
];

const componentCreators = [...REQUIRED_COMPONENTS, ...OPTIONAL_COMPONENTS];

export default componentCreators;
