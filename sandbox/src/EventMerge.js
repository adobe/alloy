import React, { useRef, useEffect } from "react";

export default function EventMerge() {
  const eventMergeIdPromise = useRef(window.alloy("createEventMergeId"));

  useEffect(() => {
    eventMergeIdPromise.current.then(eventMergeId => {
      window
        .alloy("event", {
          xdm: {
            key1: "value1",
            eventMergeId
          }
        })
        .catch(console.error);

      setTimeout(() => {
        window
          .alloy("event", {
            xdm: {
              key2: "value2",
              eventMergeId
            }
          })
          .catch(console.error);
      }, 3000);
    });
  }, []);

  return (
    <div>
      <h2>Event Merge</h2>
      <p>This is the Event Merge view, part of the Single Page Application.</p>
      <p>
        On this view, we are sending two events at different times, merged
        together using an event merge ID.
      </p>
    </div>
  );
}
