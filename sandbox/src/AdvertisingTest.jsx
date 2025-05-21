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

export default function AdvertisingTest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Options for sendAdConversion
  const [options, setOptions] = useState({
    viewThruEnabled: true,
    clickThruEnabled: false,
    campaignId: "test-campaign",
    placementId: "test-placement",
    channelName: "test-channel",
  });

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
