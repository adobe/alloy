/* eslint-disable no-bitwise, no-console */
import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./InAppMessagesStyle.css";

const configKey = "cjmProdNld2";

const config = {
  cjmProdNld2: {
    datastreamId: "7a19c434-6648-48d3-948f-ba0258505d98",
    surface: "mobileapp://com.adobe.iamTutorialiOS",
    decisionContext: {
      "~type": "com.adobe.eventType.generic.track",
      "~source": "com.adobe.eventSource.requestContent",
      state: "",
      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek": 1
    },
    activeCampaigns: [
      "https://experience.adobe.com/#/@cjmprodnld2/sname:prod/journey-optimizer/campaigns/summary/59bfdc09-03b9-4cd5-9ab8-5c2a045b0b2e"
    ]
  },
  aemonacpprodcampaign: {
    datastreamId: "8cefc5ca-1c2a-479f-88f2-3d42cc302514",
    surface: "mobileapp://com.adobe.aguaAppIos",
    decisionContext: {},
    activeCampaigns: [
      "https://experience.adobe.com/#/@aemonacpprodcampaign/sname:prod/journey-optimizer/campaigns/summary/8bb52c05-d381-4d8b-a67a-95f345776322"
    ]
  }
};

const { datastreamId, surface, decisionContext } = config[configKey];

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

export default function InAppMessages() {
  const [response, setResponse] = useState(null);
  const getInAppPayload = async payload => {
    const res = await fetch(
      `https://edge.adobedc.net/ee/or2/v1/interact?configId=${datastreamId}&requestId=${uuidv4()}`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    return res.json();
  };

  useEffect(() => {
    const fetchInAppPayload = async () => {
      const res = await getInAppPayload({
        events: [
          {
            query: {
              personalization: {
                surfaces: [surface]
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
      setResponse(res);
    };
    fetchInAppPayload();
  }, []);

  const renderDecisions = () => {
    window.alloy("applyResponse", {
      renderDecisions: true,
      decisionContext,
      responseBody: response
    });
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>In App Messages For Web</h1>
      <button onClick={() => renderDecisions()}>
        Execute Decisions and Render
      </button>
    </div>
  );
}
