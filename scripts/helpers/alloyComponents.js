/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default [
  {
    name: "Activity Collector",
    parameter: "activitycollector",
    component: "createActivityCollector",
    checked: true,
  },
  {
    name: "Audiences",
    parameter: "audiences",
    component: "createAudiences",
    checked: true,
  },
  {
    name: "Context",
    parameter: "context",
    component: "createContext",
    checked: true,
  },
  {
    name: "Decision Engine",
    parameter: "decisioningengine",
    component: "createDecisioningEngine",
    checked: true,
  },
  {
    name: "Event Merge",
    parameter: "eventmerge",
    component: "createEventMerge",
    checked: true,
  },
  {
    name: "Personalization",
    parameter: "personalization",
    component: "createPersonalization",
    checked: true,
  },
  {
    name: "Privacy",
    parameter: "privacy",
    component: "createPrivacy",
    checked: true,
  },
  {
    name: "Streaming Media",
    parameter: "streamingmedia",
    component: "createStreamingMedia",
    checked: true,
  },
  {
    name: "Legacy Media Analytics",
    parameter: "legacymediaanalytics",
    component: "createLegacyMediaAnalytics",
    checked: true,
  },
  {
    name: "Machine Learning",
    parameter: "machinelearning",
    component: "createMachineLearning",
    checked: true,
  },
];
