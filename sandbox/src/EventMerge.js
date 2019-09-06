import React, { useRef, useEffect } from "react";

export default function EventMerge() {
  const eventMergeId = useRef(window.alloy("createEventMergeId"));

  useEffect(() => {
    window
      .alloy("event", {
        xdm: {
          key1: "value1",
          eventMergeId: eventMergeId.current
        }
      })
      .catch(console.error);

    setTimeout(() => {
      window
        .alloy("event", {
          xdm: {
            key2: "value2",
            eventMergeId: eventMergeId.current
          }
        })
        .catch(console.error);
    }, 3000);
  }, []);

  return (
    <div>
      <h2>Event Merge</h2>
      <h3>
        This is the Event Merge view, part of the Single Page Application.
      </h3>
      <p>
        On this view, we are sending two events at different times, merged
        together using an event merge ID.
      </p>
    </div>
  );
}
