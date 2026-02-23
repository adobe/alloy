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
const components = {
  activityCollector: {
    default: true,
    description:
      "This component enables automatic link collection and ActivityMap tracking.",
  },

  advertising: {
    beta: true,
    description:
      "This component enables Adobe Advertising integration with CJA.",
  },

  audiences: {
    default: true,
    description:
      "This component supports Audience Manager integration including running URL and cookie destination and id syncs.",
  },

  brandConcierge: {
    beta: true,
    default: false,
    description: "This component enables Brand Concierge integration.",
  },

  consent: {
    default: true,
    description:
      "This component supports consent integrations. You must include this component if you are using the Set consent action.",
  },

  eventMerge: {
    default: true,
    deprecated: true,
    description:
      "This component is deprecated. You must include this component if you are using the Event merge ID data element or Reset event merge ID action.",
  },

  mediaAnalyticsBridge: {
    default: true,
    description:
      "This component enables Edge streaming media using the media analytics interface. You must include this component if you are using the Get media analytics tracker action.",
  },

  personalization: {
    default: true,
    description:
      "This component enables Adobe Target and Adobe Journey Optimizer integrations.",
  },

  rulesEngine: {
    default: true,
    description:
      "This component enables Adobe Journey Optimizer on device decisioning. You must include this component if you are using the Evaluate rulesets action or the Subcribe ruleset items event.",
  },

  streamingMedia: {
    default: true,
    description:
      "This component enables Edge streaming media. You must include this component if you are using the Send media event action.",
  },

  pushNotifications: {
    beta: true,
    description:
      "This component enables web push notifications for Adobe Journey Optimizer.",
  },
};

const DEFAULT_COMPONENTS = new Set(
  Object.keys(components).filter((key) => components[key].default),
);

export const isDefaultComponent = (component) =>
  DEFAULT_COMPONENTS.has(component);

export default components;
