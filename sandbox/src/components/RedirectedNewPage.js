import React, { useEffect } from "react";
import ContentSecurityPolicy from "./ContentSecurityPolicy";

export default function RedirectedNewPage() {
  useEffect(() => {
    window
      .alloy("sendEvent", {
        renderDecisions: true
      })
      .then(({ decisions = [] }) => {
        console.log("personalized decisions on the redirected view", decisions);
      });
  }, []);
  return (
    <div className="personalization-container">
      <ContentSecurityPolicy />
      <div>
        <h1>You have qualified for the redirect offer</h1>
        <h2>Here are the newer offers!</h2>
      </div>
    </div>
  );
}
