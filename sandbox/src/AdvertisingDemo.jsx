/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useState } from "react";
import AdvertisingTestCSP from "./components/AdvertisingTestCSP";
import useAlloy from "./helpers/useAlloy";

const AdvertisingDemo = () => {
  const [eventResult, setEventResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [advertisingConfig, setAdvertisingConfig] = useState({
    handleAdvertisingData: "auto",
  });

  // Initialize Alloy with advertising configuration (same as other pages)
  useAlloy();

  const handleSendEvent = async (eventType) => {
    setLoading(true);
    setEventResult("");

    try {
      const eventData = {
        xdm: {
          eventType: eventType,
          web: {
            webPageDetails: {
              URL: window.location.href,
              name: "Advertising Demo Page",
            },
          },
        },
        data: {
          advertising: {
            testEvent: true,
            eventType: eventType,
          },
        },
      };

      // Add advertising configuration to the event
      if (advertisingConfig.handleAdvertisingData) {
        eventData.advertising = {
          handleAdvertisingData: advertisingConfig.handleAdvertisingData,
        };
      }

      const result = await window.alloy("sendEvent", eventData);
      setEventResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setEventResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setAdvertisingConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <AdvertisingTestCSP />

      <h1>Advertising Component Demo</h1>

      <div style={{ marginBottom: "30px" }}>
        <h2>Current Alloy Configuration</h2>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
        >
          <pre>{`advertising: {
  id5PartnerId: 1650,
  rampIdJSPath: "https://cdn.jsdelivr.net/npm/ramp-id@1.0.0/ramp-id.min.js",
  dspEnabled: true,
  advertiserSettings: [
    {
      advertiserId: "test-advertiser-1",
      enabled: true
    }
  ]
}`}</pre>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Event Configuration</h2>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            <strong>handleAdvertisingData:</strong>
          </label>
          <select
            value={advertisingConfig.handleAdvertisingData}
            onChange={(e) =>
              handleConfigChange("handleAdvertisingData", e.target.value)
            }
            style={{ padding: "8px", marginRight: "10px" }}
          >
            <option value="auto">auto (default)</option>
            <option value="auto">wait</option>
            <option value="disabled">disabled</option>
          </select>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Controls how advertising IDs are collected and attached to events
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Test Events</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleSendEvent("web.webpagedetails.pageViews")}
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Send Page View
          </button>

          <button
            onClick={() => handleSendEvent("commerce.purchases")}
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Send Purchase Event
          </button>

          <button
            onClick={() => handleSendEvent("advertising.clicks")}
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Send Ad Click
          </button>

          <button
            onClick={() => handleSendEvent("advertising.impressions")}
            disabled={loading}
            style={{
              padding: "10px 15px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Send Ad Impression
          </button>
        </div>
      </div>

      {loading && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#e7f3ff",
            border: "1px solid #b3d7ff",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <strong>Sending event...</strong> Collecting advertising IDs and
          sending to Edge Network.
        </div>
      )}

      {eventResult && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Event Result</h2>
          <pre
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "5px",
              border: "1px solid #dee2e6",
              overflow: "auto",
              fontSize: "12px",
            }}
          >
            {eventResult}
          </pre>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h2>Advertising Component Features</h2>
        <ul style={{ lineHeight: "1.6" }}>
          <li>
            <strong>ID Collection:</strong> Automatically collects Surfer ID,
            ID5 ID, and Ramp ID
          </li>
          <li>
            <strong>Parallel Processing:</strong> Collects all advertising IDs
            simultaneously for better performance
          </li>
          <li>
            <strong>Error Resilience:</strong> Individual ID collection failures
            don't block other IDs or events
          </li>
          <li>
            <strong>Configurable Timing:</strong> Control whether to wait for
            IDs or proceed immediately
          </li>
          <li>
            <strong>DSP Integration:</strong> Support for Demand Side Platform
            advertising workflows
          </li>
          <li>
            <strong>Ad Conversion Tracking:</strong> Built-in support for
            conversion attribution
          </li>
        </ul>
      </div>

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Note:</strong> This demo shows the advertising component in
          action. Check the browser's network tab to see the advertising IDs
          being collected and attached to events sent to the Edge Network.
        </p>
      </div>
    </div>
  );
};

export default AdvertisingDemo;
