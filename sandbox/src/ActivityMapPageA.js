import React, { useEffect, useRef } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

function ActivityMapPageA() {
  useSendPageViewEvent();

  const countingButtonRef = useRef(null);

  useEffect(() => {
    let buttonClickCounter = 0;
    const changeButtonText = () => {
      buttonClickCounter++;
      if (countingButtonRef.current) {
        countingButtonRef.current.innerHTML = `Clicked ${buttonClickCounter} times`;
      }
    };

    if (countingButtonRef.current) {
      countingButtonRef.current.addEventListener("click", changeButtonText);
    }

    return () => {
      if (countingButtonRef.current) {
        countingButtonRef.current.removeEventListener(
          "click",
          changeButtonText
        );
      }
    };
  }, []);

  return (
    <div id="maindiv">
      <ContentSecurityPolicy />
      <h1>ActivityMap Test Page A</h1>
      <h2>Internal Links</h2>
      <p>
        <a href="/activityMapIndex">ActivityMap Index</a>
      </p>
      <p>
        <button
          id="counting-button"
          className="rounded-button"
          ref={countingButtonRef}
        >
          Button with Click Handler
        </button>
      </p>
    </div>
  );
}

export default ActivityMapPageA;