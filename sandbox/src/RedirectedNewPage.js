import React from "react";
import ContentSecurityPolicy from "./ContentSecurityPolicy";

export default function RedirectedNewPage() {
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
