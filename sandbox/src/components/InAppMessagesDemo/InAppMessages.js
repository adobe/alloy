/* eslint-disable no-bitwise, no-console */
import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./InAppMessagesStyle.css";

const configKey = localStorage.getItem("iam-configKey") || "stage";

const config = {
  cjmProdNld2: {
    name: "CJM Prod NLD2 – Prod (NLD2)",
    alloyInstance: window.alloy,
    datastreamId: "7a19c434-6648-48d3-948f-ba0258505d98",
    orgId: "4DA0571C5FDC4BF70A495FC2@AdobeOrg",
    decisionContext: {},
    edgeDomain: "edge.adobedc.net"
  },
  aemonacpprodcampaign: {
    name: "AEM Assets Departmental - Campaign – Prod (VA7)",
    alloyInstance: window.iamAlloy,
    datastreamId: "8cefc5ca-1c2a-479f-88f2-3d42cc302514",
    orgId: "906E3A095DC834230A495FD6@AdobeOrg",
    decisionContext: {},
    edgeDomain: "edge.adobedc.net"
  },
  stage: {
    name: "CJM Stage - AJO Web (VA7)",
    alloyInstance: window.iamAlloy,
    datastreamId: "15525167-fd4e-4511-b9e0-02119485784f",
    orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
    decisionContext: {},
    edgeDomain: "edge-int.adobedc.net"
  }
};

const {
  datastreamId,
  orgId,
  decisionContext,
  edgeDomain,
  alloyInstance
} = config[configKey];

if (alloyInstance !== window.alloy) {
  alloyInstance("configure", {
    datastreamId,
    orgId,
    edgeDomain,
    thirdPartyCookiesEnabled: false,
    targetMigrationEnabled: false,
    debugEnabled: true
  });
}

export default function InAppMessages() {
  const [sentEvent, setSentEvent] = useState(false);
  const [customTraitKey, setCustomTraitKey] = useState("");
  const [customTraitValue, setCustomTraitValue] = useState("");

  useEffect(() => {
    const unsubscribePromise = alloyInstance("subscribeRulesetItems", {
      callback: result => {
        console.log("subscribeRulesetItems", result);
      }
    });

    return () => {
      unsubscribePromise.then(({ unsubscribe }) => unsubscribe());
    };
  }, []);

  const renderDecisions = (useEvaluateRulesetsCommand = false) => {
    const context = { ...decisionContext };

    if (customTraitKey.length !== 0 && customTraitValue.length !== 0) {
      context[customTraitKey] = customTraitValue;
    }

    if (useEvaluateRulesetsCommand) {
      alloyInstance("evaluateRulesets", {
        renderDecisions: true,
        decisionContext: context
      });
      return;
    }

    alloyInstance("sendEvent", {
      renderDecisions: true,
      decisionContext: context,
      personalization: { surfaces: ["#hello"] }
    }).then(() => setSentEvent(true));
  };

  const deleteAllCookies = () => {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  const setNewConfigEnv = value => {
    localStorage.setItem("iam-configKey", value);
    deleteAllCookies();
    window.location.reload();
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>In App Messages For Web</h1>
      <div>
        <label htmlFor="cars">Environment:</label>
        <select
          id="configEnv"
          name="configEnv"
          onChange={evt => setNewConfigEnv(evt.target.value)}
          defaultValue={configKey}
        >
          {Object.keys(config).map(conf => (
            <option key={conf} value={conf}>
              {config[conf].name}
            </option>
          ))}
        </select>
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
        <button onClick={() => renderDecisions()}>sendEvent</button>
        <button onClick={() => renderDecisions(true)} disabled={!sentEvent}>
          evaluateRulesets
        </button>
      </div>
    </div>
  );
}
