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
  query eventsQuery($sessionUuid: UUID!, $cursor: EventCursor) {
    events(sessionUuid:$sessionUuid,first:1000,after:$cursor){
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
      let cursor = null;
      let events = [];
      let i = 0;
      return {
        current: () => {
          return events[i];
        },
        advance: async () => {
          if (i >= events.length) {
            if (events.length > 0) {
              const { eventNumber, timestamp } = events[events.length - 1];
              cursor = { eventNumber, timestamp, sessionUuid };
            }
            const response = await makeGraphRequest(FETCH_EVENTS_QUERY, {
              sessionUuid,
              cursor
            });
            events = response.events;
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
