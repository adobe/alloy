import React, { useRef, useEffect } from "react";
import useSendPageViewEvent from "./useSendPageViewEvent";

const isBrowser = typeof window !== "undefined"

export default function EventMerge() {
  useSendPageViewEvent();
  if (isBrowser) {
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
      <h1>Event Merge</h1>
      <p>This is the Event Merge view, part of the Single Page Application.</p>
      <p>
        On this view, we are sending two events at different times, merged
        together using an event merge ID.
      </p>
    </div>
  );
}
}