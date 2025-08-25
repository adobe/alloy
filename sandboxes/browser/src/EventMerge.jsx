/* eslint-disable no-console */

import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import useSendPageViewEvent from "./helpers/useSendPageViewEvent";

export default function EventMerge() {
  const [eventMergeIdPromise, setEventMergeIdPromise] = React.useState(null);

  useAlloy();
  useSendPageViewEvent();

  useEffect(() => {
    setEventMergeIdPromise(window.alloy("createEventMergeId"));
  }, []);

  useEffect(() => {
    if (!eventMergeIdPromise) {
      return;
    }

    eventMergeIdPromise.then((result) => {
      window
        .alloy("sendEvent", {
          xdm: {
            key1: "value1",
            eventMergeId: result.eventMergeId,
          },
        })
        .catch(console.error);

      setTimeout(() => {
        window
          .alloy("sendEvent", {
            xdm: {
              key2: "value2",
              eventMergeId: result.eventMergeId,
            },
          })
          .catch(console.error);
      }, 3000);
    });
  }, [eventMergeIdPromise]);

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Event Merge</h1>
      <p>This is the Event Merge view, part of the Single Page Application.</p>
      <p>
        On this view, we are sending two events at different times, merged
        together using an event merge ID.
      </p>
    </div>
  );
}
