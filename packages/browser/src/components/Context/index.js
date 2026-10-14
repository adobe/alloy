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

import injectWeb from "./injectWeb.js";
import injectDevice from "./injectDevice.js";
import injectEnvironment from "./injectEnvironment.js";
import injectPlaceContext from "./injectPlaceContext.js";
import injectTimestamp from "@adobe/alloy-core/utils/injectTimestamp.js";
import implementationDetails from "./implementationDetails.js";
import createComponent from "./createComponent.js";
import injectHighEntropyUserAgentHints from "./injectHighEntropyUserAgentHints.js";
import injectOneTimeAnalyticsReferrer from "./injectOneTimeAnalyticsReferrer.js";
import { arrayOf, objectOf, string } from "@adobe/alloy-core/utils/validation";

const web = injectWeb(window);
const device = injectDevice(window);
const environment = injectEnvironment(window);
const placeContext = injectPlaceContext(() => new Date());
const timestamp = injectTimestamp(() => new Date());
// A null timestamp tells Edge Network to stamp the event with its own time.
/** @param {import("@adobe/alloy-core/core/types.js").Event} event */
const serverSideTimestamp = (event) => {
  event.mergeXdm({ timestamp: null });
};
const highEntropyUserAgentHints = injectHighEntropyUserAgentHints(navigator);
const oneTimeAnalyticsReferrer = injectOneTimeAnalyticsReferrer(window);

const defaultEnabledContexts = {
  web,
  device,
  environment,
  placeContext,
};
const defaultDisabledContexts = {
  highEntropyUserAgentHints,
  oneTimeAnalyticsReferrer,
  serverSideTimestamp,
};
const optionalContexts = {
  ...defaultEnabledContexts,
  ...defaultDisabledContexts,
};

const createContext = ({ config, logger }) => {
  // serverSideTimestamp replaces the client timestamp. Optional contexts run
  // before required ones, so the client timestamp would otherwise overwrite it.
  const requiredContexts = config.context.includes("serverSideTimestamp")
    ? [implementationDetails]
    : [timestamp, implementationDetails];
  return createComponent(config, logger, optionalContexts, requiredContexts);
};
createContext.namespace = "Context";
createContext.configValidators = objectOf({
  context: arrayOf(string()).default(Object.keys(defaultEnabledContexts)),
});

export default createContext;
