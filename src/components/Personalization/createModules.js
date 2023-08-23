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
import {
  DOM_ACTION,
  MESSAGE_FEED_ITEM,
  MESSAGE_IN_APP
} from "./constants/schema";
import { initDomActionsModules } from "./dom-actions";
import initMessagingActionsModules from "./in-app-message-actions/initMessagingActionsModules";

export default ({ storeClickMetrics, collect }) => {
  const messagingActionsModules = initMessagingActionsModules(collect);

  return {
    [DOM_ACTION]: initDomActionsModules(storeClickMetrics),
    [MESSAGE_IN_APP]: messagingActionsModules,
    [MESSAGE_FEED_ITEM]: messagingActionsModules
  };
};
