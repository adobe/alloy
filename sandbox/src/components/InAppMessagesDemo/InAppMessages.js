import React, { useState, useEffect } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./InAppMessagesStyle.css";

export default function DecisionEngine() {
  const [realResponse, setRealResponse] = useState(null);
  const getInAppPayload = async payload => {
    const res = await fetch(
      `https://edge.adobedc.net/ee/or2/v1/interact?configId=7a19c434-6648-48d3-948f-ba0258505d98&requestId=520353b2-dc0d-428c-9e0d-138fc6cbec4e`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    return res.json();
  };

  useEffect(() => {
    const fetchInAppPayload = async () => {
      const response = await getInAppPayload({
        events: [
          {
            query: {
              personalization: {
                surfaces: ["mobileapp://com.adobe.iamTutorialiOS"]
              }
            },
            xdm: {
              timestamp: new Date().toISOString(),
              implementationDetails: {
                name: "https://ns.adobe.com/experience/mobilesdk/ios",
                version: "3.7.4+1.5.0",
                environment: "app"
              }
            }
          }
        ]
      });
      setRealResponse(response);
    };
    fetchInAppPayload();
  }, []);

  const renderDecisions = e => {
    e.stopPropagation();
    e.preventDefault();
    window.alloy("evaluateRulesets", {
      "~type": "com.adobe.eventType.generic.track",
      "~source": "com.adobe.eventSource.requestContent",
      state: "",
      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek": 1
    });

    window.alloy("applyResponse", {
      renderDecisions: true,
      decisionContext: {
        "~type": "com.adobe.eventType.generic.track",
        "~source": "com.adobe.eventSource.requestContent",
        state: "",
        "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek": 1
      },
      responseBody: realResponse
    });
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>In App Messages For Web</h1>
      <button onClick={renderDecisions}>Execute Decisions and Render</button>
    </div>
  );
}
