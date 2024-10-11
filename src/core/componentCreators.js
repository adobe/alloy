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

// This file contains the optional components that can be included in an alloy build.
// The exports names must have the camel case format. If you need to add a required
// module, you should add it to the core/requiredComponentCreators.js file.

export { default as activityCollector } from "../components/ActivityCollector/index.js";
export { default as audiences } from "../components/Audiences/index.js";
export { default as autoImplementation } from "../components/AutoImplementation/index.js";
export { default as context } from "../components/Context/index.js";
export { default as decisioningEngine } from "../components/DecisioningEngine/index.js";
export { default as eventMerge } from "../components/EventMerge/index.js";
export { default as legacyMediaAnalytics } from "../components/LegacyMediaAnalytics/index.js";
export { default as personalization } from "../components/Personalization/index.js";
export { default as privacy } from "../components/Privacy/index.js";
export { default as streamingMedia } from "../components/StreamingMedia/index.js";
