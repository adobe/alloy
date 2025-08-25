/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./InAppMessagesStyle.css";
import { deleteAllCookies, getAlloyTestConfigs } from "../utils";
import useAlloy from "../../helpers/useAlloy";

const configKey =
  localStorage.getItem("iam-configKey") || "aemonacpprodcampaign";

const config = getAlloyTestConfigs();

const { datastreamId, orgId, decisionContext, edgeDomain } = config[configKey];

const getURLParams = (key) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
};

const CUSTOM_TRAIT_KEY = "iam-customtrait-key";
const CUSTOM_TRAIT_VALUE = "iam-customtrait-value";

export default function InAppMessages() {
  const [sentEvent, setSentEvent] = useState(false);
  const [customTraitKey, setCustomTraitKeyInternal] = useState(
    localStorage.getItem(CUSTOM_TRAIT_KEY) || "",
  );
  const [customTraitValue, setCustomTraitValueInternal] = useState(
    localStorage.getItem(CUSTOM_TRAIT_VALUE) || "",
  );

  const setCustomTraitKey = (value) => {
    setCustomTraitKeyInternal(value);
    localStorage.setItem(CUSTOM_TRAIT_KEY, value);
  };

  const setCustomTraitValue = (value) => {
    setCustomTraitValueInternal(value);
    localStorage.setItem(CUSTOM_TRAIT_VALUE, value);
  };

  useAlloy({
    configurations: {
      alloy: {
        defaultConsent: getURLParams("defaultConsent") || "in",
        datastreamId,
        orgId,
        edgeDomain,
        thirdPartyCookiesEnabled: false,
        targetMigrationEnabled: false,
        personalizationStorageEnabled: true,
        debugEnabled: true,
      },
    },
  });

  useEffect(() => {
    const unsubscribePromise = window.alloy("subscribeRulesetItems", {
      callback: (result) => {
        console.log("subscribeRulesetItems", result);
      },
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
      window.alloy("evaluateRulesets", {
        renderDecisions: true,
        personalization: {
          decisionContext: context,
        },
      });
      return;
    }

    window
      .alloy("sendEvent", {
        renderDecisions: true,
        type: "decisioning.propositionFetch",
        personalization: {
          surfaces: ["#hello"],
          decisionContext: context,
          sendDisplayEvent: false,
        },
      })
      .then(() => {
        setSentEvent(true);
      });
  };

  const sendDisplayEvents = () => {
    window.alloy("sendEvent", {
      renderDecisions: false,
      personalization: {
        includeRenderedPropositions: true,
      },
    });
  };

  const setNewConfigEnv = (value) => {
    localStorage.setItem("iam-configKey", value);
    deleteAllCookies();
    window.location.reload();
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>In App Messages For Web</h1>
      <div>
        <label htmlFor="configEnv">Environment:</label>
        <select
          id="configEnv"
          name="configEnv"
          onChange={(evt) => setNewConfigEnv(evt.target.value)}
          defaultValue={configKey}
        >
          {Object.keys(config).map((conf) => (
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
              onChange={(evt) => setCustomTraitKey(evt.target.value)}
            />
          </span>
          <span style={{ marginRight: "20px" }}>
            <label htmlFor="input-custom-trait-value">Value</label>
            <input
              id="input-custom-trait-value"
              type="text"
              value={customTraitValue}
              onChange={(evt) => setCustomTraitValue(evt.target.value)}
            />
          </span>
        </div>
        <button onClick={() => renderDecisions()}>sendEvent</button>
        <button onClick={() => sendDisplayEvents()} disabled={!sentEvent}>
          send display events
        </button>
        <button onClick={() => renderDecisions(true)} disabled={!sentEvent}>
          evaluateRulesets
        </button>
      </div>
    </div>
  );
}
