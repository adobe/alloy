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

import React, { useState, useEffect } from "react";
import AdvertisingTestCSP from "./components/AdvertisingTestCSP";

export default function AdvertisingTest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [configInfo, setConfigInfo] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Options for sendAdConversion
  const [options, setOptions] = useState({
    viewThruEnabled: true,
    clickThruEnabled: false,
    campaignId: "test-campaign",
    placementId: "test-placement",
    channelName: "test-channel",
  });

  // State for tracking advertising identities
  const [identities, setIdentities] = useState(null);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);

  // Configure Alloy once when the component mounts
  useEffect(() => {
    // Only configure if not already configured
    window.alloy("configure", {
      orgId: "5BFE274A5F6980A50A495C08@AdobeOrg", // Default sandbox org ID
      edgeConfigId: "f46e981f-fd03-4bdd-a9d9-73ce4447f870", // Sandbox edge config
      debugEnabled: true,
      componentsBeforeInitialization: ["Advertising"],
    });

    console.log("Alloy configured during component mount");
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSendAdConversion = () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    window
      .alloy("sendAdConversion", options)
      .then((result) => {
        setResult(JSON.stringify(result, null, 2));
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message || "Unknown error");
        setIsLoading(false);
      });
  };

  const fetchLibraryInfo = () => {
    setConfigLoading(true);
    setConfigInfo(null);

    window
      .alloy("getLibraryInfo")
      .then((info) => {
        console.log("Library info:", info);
        setConfigInfo(JSON.stringify(info, null, 2));
        setConfigLoading(false);
      })
      .catch((error) => {
        console.error("Error getting library info:", error);
        setError(`Error fetching library info: ${error.message}`);
        setConfigLoading(false);
      });
  };

  const handleGetAdvertisingIdentity = () => {
    setIdentitiesLoading(true);
    setIdentities(null);
    setError(null);

    window
      .alloy("getAdvertisingIdentity")
      .then((result) => {
        setIdentities(result);
        setIdentitiesLoading(false);
      })
      .catch((error) => {
        setError(error.message || "Error retrieving advertising identities");
        setIdentitiesLoading(false);
      });
  };

  return (
    <div>
      <AdvertisingTestCSP />
      <h1>Advertising Component Test</h1>
      <p>
        This page has a relaxed Content Security Policy that allows frames from
        pixel.everesttech.net and everestjs.net for testing the Advertising
        component.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <h3>Configuration Information</h3>
        <button
          onClick={fetchLibraryInfo}
          disabled={configLoading}
          style={{ marginBottom: "10px" }}
        >
          {configLoading ? "Loading..." : "Fetch Library Info"}
        </button>

        {configInfo && (
          <div>
            <h4>SDK Configuration:</h4>
            <pre
              style={{
                background: "#eef4ff",
                padding: "10px",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              {configInfo}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>sendAdConversion Options</h3>
        <div>
          <label>
            <input
              type="checkbox"
              name="viewThruEnabled"
              checked={options.viewThruEnabled}
              onChange={handleChange}
            />
            View-Through Enabled
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="clickThruEnabled"
              checked={options.clickThruEnabled}
              onChange={handleChange}
            />
            Click-Through Enabled
          </label>
        </div>
        <div>
          <label>
            Campaign ID:
            <input
              type="text"
              name="campaignId"
              value={options.campaignId}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Placement ID:
            <input
              type="text"
              name="placementId"
              value={options.placementId}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Channel Name:
            <input
              type="text"
              name="channelName"
              value={options.channelName}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>

      <button onClick={handleSendAdConversion} disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Ad Conversion"}
      </button>

      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <h3>Get Advertising Identities</h3>
        <button
          onClick={handleGetAdvertisingIdentity}
          disabled={identitiesLoading}
        >
          {identitiesLoading ? "Retrieving..." : "Get Advertising Identities"}
        </button>

        {identities && (
          <div style={{ marginTop: "10px" }}>
            <h4>Advertising Identities:</h4>
            <div
              style={{
                background: "#f4fff4",
                padding: "10px",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              {identities.id5_id && (
                <div>
                  <strong>ID5 ID:</strong> {identities.id5_id}
                </div>
              )}
              {identities.ramp_id && (
                <div>
                  <strong>Ramp ID:</strong> {identities.ramp_id}
                </div>
              )}
              {identities.surfer_id && (
                <div>
                  <strong>Surfer ID:</strong> {identities.surfer_id}
                </div>
              )}
              <div style={{ marginTop: "10px" }}>
                <strong>Raw data:</strong>
                <pre>{JSON.stringify(identities, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <pre style={{ background: "#f4f4f4", padding: "10px" }}>{result}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>Error:</h3>
          <pre style={{ background: "#fff0f0", padding: "10px" }}>{error}</pre>
        </div>
      )}
    </div>
  );
}
