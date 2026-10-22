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
import { createRequest } from "../../utils/request/index.js";

const BRAND_CONCIERGE_PATH = "/brand-concierge";
const VOICE_BRAND_CONCIERGE_PATH = "/brand-concierge-voice";

export default ({
  payload,
  action = "conversations",
  sessionId,
  voiceEnabled = false,
  region,
}) => {
  const edgeSubPath = voiceEnabled
    ? VOICE_BRAND_CONCIERGE_PATH
    : `${BRAND_CONCIERGE_PATH}${region ? `/${region}` : ""}`;

  return createRequest({
    payload: payload,
    edgeSubPath,
    requestParams: { sessionId },
    getAction() {
      return action;
    },
    getUseSendBeacon() {
      return false;
    },
  });
};
