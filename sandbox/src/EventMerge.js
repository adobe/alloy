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

/* eslint-disable no-console */

import React, { useRef, useEffect } from "react";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

export default function EventMerge() {
  useSendPageViewEvent();
  const eventMergeIdPromise = useRef(window.alloy("createEventMergeId"));

  useEffect(() => {
    eventMergeIdPromise.current.then(result => {
      window
        .alloy("sendEvent", {
          xdm: {
            key1: "value1",
            eventMergeId: result.eventMergeId
          }
        })
        .catch(console.error);

      setTimeout(() => {
        window
          .alloy("sendEvent", {
            xdm: {
              key2: "value2",
              eventMergeId: result.eventMergeId
            }
          })
          .catch(console.error);
      }, 3000);
    });
  }, []);

  return (
    <div>
      <ContentSecurityPolicy />
      <Heading level={1}>Event Merge</Heading>
      <p>This is the Event Merge view, part of the Single Page Application.</p>
      <p>
        On this view, we are sending two events at different times, merged
        together using an event merge ID.
      </p>
    </div>
  );
}
