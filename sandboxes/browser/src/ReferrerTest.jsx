/* eslint-disable no-underscore-dangle */

import React, { useState, useCallback } from "react";
import useAlloy from "./helpers/useAlloy";

export default function ReferrerTest() {
  const [events, setEvents] = useState([]);
  const [mockReferrer, setMockReferrer] = useState("https://www.example.com");
  const [explicitReferrer, setExplicitReferrer] = useState("");
  const captureEventAnalyticsRef = React.useRef(false);

  const onBeforeEventSend = useCallback(({ xdm, data }) => {
    if (captureEventAnalyticsRef.current) {
      const analyticsReferrer = data?.__adobe?.analytics?.referrer;
      const xdmReferrer = xdm?.web?.webReferrer?.URL;

      setEvents((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          analyticsReferrer,
          xdmReferrer,
          currentDocumentReferrer: document.referrer,
        },
      ]);

      captureEventAnalyticsRef.current = false;
    }
  }, []);

  useAlloy({
    configurations: {
      alloy: {
        context: [
          "web",
          "device",
          "environment",
          "placeContext",
          "oneTimeAnalyticsReferrer",
        ],
        clickCollectionEnabled: false,
        onBeforeEventSend,
      },
    },
  });

  const sendEvent = async () => {
    captureEventAnalyticsRef.current = true;
    await window.alloy("sendEvent", {
      xdm: {
        eventType: "web.webpagedetails.pageViews",
      },
    });
  };

  const sendEventWithExplicitReferrer = async () => {
    if (!explicitReferrer) {
      alert("Please enter a referrer value first");
      return;
    }

    captureEventAnalyticsRef.current = true;
    await window.alloy("sendEvent", {
      xdm: {
        eventType: "web.webpagedetails.pageViews",
      },
      data: {
        __adobe: {
          analytics: {
            referrer: explicitReferrer,
          },
        },
      },
    });
  };

  const simulateReferrerChange = () => {
    // In a real SPA, the referrer would change when navigating
    // For testing, we'll use Object.defineProperty to mock it
    Object.defineProperty(document, "referrer", {
      value: mockReferrer,
      writable: true,
      configurable: true,
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div>
      <h1>Referrer Context Test</h1>

      <section
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <h2>Current State</h2>
        <p>
          <strong>document.referrer:</strong> {document.referrer || "(empty)"}
        </p>
        <p>
          <strong>Context enabled:</strong> referrer
        </p>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          <strong>Note:</strong> When loading this page directly (not from
          another page), document.referrer will be empty. To test with an actual
          referrer, navigate here from another page (like Google) or use the
          &quot;Simulate Referrer Change&quot; button below.
        </p>
      </section>

      <section
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <h2>Test Actions</h2>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Basic Event</h3>
          <button onClick={sendEvent}>Send Event (Automatic Referrer)</button>
          <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            Sends an event with the referrer managed automatically by the
            context
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>
            Explicit Referrer (SPA Use Case)
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <label htmlFor="explicitReferrerInput">
              Referrer value:{" "}
              <input
                id="explicitReferrerInput"
                type="text"
                value={explicitReferrer}
                onChange={(e) => setExplicitReferrer(e.target.value)}
                style={{ width: "300px" }}
                placeholder="/previous-spa-page"
              />
            </label>
            <button onClick={sendEventWithExplicitReferrer}>
              Send Event with Explicit Referrer
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#666" }}>
            For SPAs: Explicitly set the referrer to indicate a view change
          </p>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>
            Simulate document.referrer Change
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <label htmlFor="mockReferrerInput">
              New document.referrer:{" "}
              <input
                id="mockReferrerInput"
                type="text"
                value={mockReferrer}
                onChange={(e) => setMockReferrer(e.target.value)}
                style={{ width: "300px" }}
              />
            </label>
            <button onClick={simulateReferrerChange}>
              Change document.referrer
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Mocks a referrer change (normally doesn&apos;t change in SPAs)
          </p>
        </div>

        <div>
          <button onClick={clearEvents}>Clear Log</button>
        </div>
      </section>

      <section
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          marginBottom: "20px",
        }}
      >
        <h2>Event Log</h2>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
          Check the browser console for detailed event information
        </p>
        {events.length === 0 ? (
          <p>No events sent yet</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #ddd",
              backgroundColor: "white",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e0e0e0" }}>
                  <th
                    style={{
                      border: "1px solid #999",
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "100px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      border: "1px solid #999",
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "30%",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    Analytics Referrer
                    <br />
                    <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                      (data.__adobe.analytics.referrer)
                    </span>
                  </th>
                  <th
                    style={{
                      border: "1px solid #999",
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "30%",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    XDM Referrer
                    <br />
                    <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                      (xdm.web.webReferrer.URL)
                    </span>
                  </th>
                  <th
                    style={{
                      border: "1px solid #999",
                      padding: "12px 8px",
                      textAlign: "left",
                      width: "30%",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#000",
                    }}
                  >
                    document.referrer
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => {
                  const formatReferrer = (value) => {
                    if (value === undefined) return "(not set)";
                    if (value === "") return "(cleared)";
                    return value;
                  };

                  return (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9",
                      }}
                    >
                      <td
                        style={{
                          border: "1px solid #999",
                          padding: "10px 8px",
                          verticalAlign: "top",
                          fontSize: "13px",
                          color: "#000",
                        }}
                      >
                        {event.time}
                      </td>
                      <td
                        style={{
                          border: "1px solid #999",
                          padding: "10px 8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          backgroundColor:
                            event.analyticsReferrer === ""
                              ? "#ffeb3b"
                              : "transparent",
                          wordBreak: "break-all",
                          verticalAlign: "top",
                          color: "#000",
                        }}
                      >
                        {formatReferrer(event.analyticsReferrer)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #999",
                          padding: "10px 8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          wordBreak: "break-all",
                          verticalAlign: "top",
                          color: "#000",
                        }}
                      >
                        {formatReferrer(event.xdmReferrer)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #999",
                          padding: "10px 8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          wordBreak: "break-all",
                          verticalAlign: "top",
                          color: "#000",
                        }}
                      >
                        {event.currentDocumentReferrer || "(empty)"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
