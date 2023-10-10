/* eslint-disable no-bitwise, no-console */
import React, { useState } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./InAppMessagesStyle.css";

const configKey = "stage";

const config = {
  cjmProdNld2: {
    datastreamId: "7a19c434-6648-48d3-948f-ba0258505d98",
    orgId: "4DA0571C5FDC4BF70A495FC2@AdobeOrg",
    surface: "mobileapp://com.adobe.iamTutorialiOS",
    decisionContext: {
      "~type": "com.adobe.eventType.generic.track",
      "~source": "com.adobe.eventSource.requestContent",
      state: "",
      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek": 1
    },
    edgeDomain: "edge.adobedc.net",
    activeCampaigns: [
      "https://experience.adobe.com/#/@cjmprodnld2/sname:prod/journey-optimizer/campaigns/summary/59bfdc09-03b9-4cd5-9ab8-5c2a045b0b2e"
    ]
  },
  aemonacpprodcampaign: {
    datastreamId: "8cefc5ca-1c2a-479f-88f2-3d42cc302514",
    orgId: "906E3A095DC834230A495FD6@AdobeOrg",
    surface: "mobileapp://com.adobe.aguaAppIos",
    decisionContext: {},
    edgeDomain: "edge.adobedc.net",
    activeCampaigns: [
      "https://experience.adobe.com/#/@aemonacpprodcampaign/sname:prod/journey-optimizer/campaigns/summary/8bb52c05-d381-4d8b-a67a-95f345776322"
    ]
  },
  stage: {
    name: "CJM Stage - AJO Web (VA7)",
    datastreamId: "15525167-fd4e-4511-b9e0-02119485784f",
    orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
    surface: "web://localhost:3000/inAppMessages",
    decisionContext: {},
    edgeDomain: "edge-int.adobedc.net"
  }
};

const { datastreamId, orgId, surface, decisionContext, edgeDomain } = config[
  configKey
];

window.iamAlloy("configure", {
  datastreamId,
  orgId,
  edgeDomain,
  thirdPartyCookiesEnabled: false,
  targetMigrationEnabled: false,
  debugEnabled: true
});

window.iamAlloy("subscribeRulesetItems", {
  surfaces: [surface],
  callback: result => {
    console.log("subscribeRulesetItems", result);
  }
});

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const getInAppPayload = async payload => {
  const res = await fetch(
    `https://${edgeDomain}/ee/or2/v1/interact?configId=${datastreamId}&requestId=${uuidv4()}`,
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
  return res.json();
};

const fetchMobilePayload = () =>
  getInAppPayload({
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

export default function InAppMessages() {
  const [customTraitKey, setCustomTraitKey] = useState("");
  const [customTraitValue, setCustomTraitValue] = useState("");

  const renderDecisions = () => {
    const context = { ...decisionContext };

    if (customTraitKey.length !== 0 && customTraitValue.length !== 0) {
      context[customTraitKey] = customTraitValue;
    }

    if (surface.startsWith("mobileapp://")) {
      fetchMobilePayload().then(response => {
        window.alloy("applyResponse", {
          renderDecisions: true,
          decisionContext: context,
          responseBody: response
        });
      });
    } else {
      window.iamAlloy("sendEvent", {
        renderDecisions: true,
        personalization: {
          surfaces: [surface]
        },
        decisionContext: context
      });
    }
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>In App Messages For Web</h1>
      <div>
        <div style={{ marginBottom: "20px" }}>
          <h3>Custom Trait</h3>
          <span style={{ marginRight: "20px" }}>
            <label htmlFor="input-custom-trait-key">Key</label>
            <input
              id="input-custom-trait-key"
              type="text"
              value={customTraitKey}
              onChange={evt => setCustomTraitKey(evt.target.value)}
            />
          </span>
          <span style={{ marginRight: "20px" }}>
            <label htmlFor="input-custom-trait-value">Value</label>
            <input
              id="input-custom-trait-value"
              type="text"
              value={customTraitValue}
              onChange={evt => setCustomTraitValue(evt.target.value)}
            />
          </span>
        </div>
        <button onClick={() => renderDecisions()}>
          Execute Decisions and Render
        </button>
      </div>
    </div>
  );
}
