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

import injectWeb from "./injectWeb";
import injectDevice from "./injectDevice";
import injectEnvironment from "./injectEnvironment";
import injectPlaceContext from "./injectPlaceContext";
import injectTimestamp from "./injectTimestamp";
import implementationDetails from "./implementationDetails";
import createComponent from "./createComponent";
import injectHighEntropyUserAgentHints from "./injectHighEntropyUserAgentHints";
import { arrayOf, objectOf, string } from "../../utils/validation";

const web = injectWeb(window);
const device = injectDevice(window);
const environment = injectEnvironment(window);
const placeContext = injectPlaceContext(() => new Date());
const timestamp = injectTimestamp(() => new Date());
const highEntropyUserAgentHints = injectHighEntropyUserAgentHints(navigator);

const defaultEnabledContexts = {
  web,
  device,
  environment,
  placeContext
};
const defaultDisabledContexts = {
  highEntropyUserAgentHints
};
const optionalContexts = {
  ...defaultEnabledContexts,
  ...defaultDisabledContexts
};
const requiredContexts = [timestamp, implementationDetails];

const createContext = ({ config, logger }) => {
  return createComponent(config, logger, optionalContexts, requiredContexts);
};
createContext.namespace = "Context";
createContext.configValidators = objectOf({
  context: arrayOf(string()).default(Object.keys(defaultEnabledContexts))
});

export default createContext;
