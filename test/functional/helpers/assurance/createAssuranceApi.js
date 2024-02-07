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
import fetch from "node-fetch";

const CREATE_SESSION_QUERY = `
  mutation createSession($session: SessionInput!) {
    createSession(session: $session) {
      orgId
      uuid
      name
      link
      token
    }
  }`;

const FETCH_EVENTS_QUERY = `
  query eventsQuery($sessionUuid: UUID!) {
    events(sessionUuid:$sessionUuid,first:100) {
      uuid
      eventNumber
      clientId
      timestamp
      vendor
      type
      payload
      annotations {
        uuid
        type
        payload
      }
    }
  }`;

export default authHeaders => {
  const makeGraphRequest = async (query, variables) => {
    const response = await fetch("https://graffias.adobe.io/graffias/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({ query, variables })
    });
    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors.message);
    }
    return json.data;
  };

  return {
    createSession: async sessionName => {
      const response = await makeGraphRequest(CREATE_SESSION_QUERY, {
        session: {
          name: sessionName,
          link: "testUrl://default"
        }
      });
      const {
        createSession: { uuid }
      } = response;
      return uuid;
    },
    fetchEvents: sessionUuid => {
      const seenUuids = new Set();
      let events = [];
      let i = 0;
      return {
        current: () => {
          return events[i];
        },
        advance: async () => {
          if (i >= events.length) {
            const response = await makeGraphRequest(FETCH_EVENTS_QUERY, {
              sessionUuid
            });
            events = response.events.filter(e => {
              if (seenUuids.has(e.uuid)) {
                return false;
              }
              seenUuids.add(e.uuid);
              return true;
            });
            i = 0;
            return events.length > 0;
          }
          i += 1;

          return i < events.length;
        }
      };
    }
  };
};
