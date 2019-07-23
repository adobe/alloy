import React, { useRef, useEffect } from "react";

export default function Stitch() {
  const stitchId = useRef(window.alloy("createStitchId"));

  useEffect(() => {
    window.alloy("event", {
      data: {
        "key1": ["value1"]
      },
      stitchId: stitchId.current
    }).catch(console.error);

    setTimeout(() => {
      window.alloy("event", {
        data: {
          "key2": ["value2"]
        },
        stitchId: stitchId.current
      }).catch(console.error);
    }, 3000);
  }, []);

  return (
    <div>
      <h2>Stitch</h2>
      <h3>This is the Stitch view, part of the Single Page Application.</h3>
      <p>
        On this view, we are sending two events at different times, stitched
        together using a stitch ID.
      </p>
    </div>
  );
}
