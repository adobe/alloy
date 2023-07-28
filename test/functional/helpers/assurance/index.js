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
import createAssuranceApi from "./createAssuranceApi";
import getAuthHeaders from "./getAuthHeaders";
import getCredentials from "./getCredentials";
import AssuranceRequestHook from "./AssuranceRequestHook";

let sessionUuid;
let events;

export const createAssuranceRequestHook = async () => {
  if (!sessionUuid) {
    const credentials = getCredentials();
    const authHeaders = await getAuthHeaders(credentials);
    const api = createAssuranceApi(authHeaders);
    const sessionName = `Tests - ${process.env.USER} - ${Math.random()
      .toString(36)
      .slice(2)}`;
    // eslint-disable-next-line no-console
    console.log(`Creating assurance session: ${sessionName}`);
    sessionUuid = await api.createSession(sessionName);
    events = api.fetchEvents(sessionUuid);
  }
  return new AssuranceRequestHook(sessionUuid, events);
};
