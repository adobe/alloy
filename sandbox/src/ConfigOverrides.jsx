import React, { useState } from "react";

const defaultOverrides = {
  experience_platform: {
    datasets: {
      event: "",
      profile: ""
    }
  },
  analytics: {
    reportSuites: []
  },
  identity: {
    idSyncContainerId: ""
  },
  target: {
    propertyToken: ""
  }
};

const sendEvent = datastreamConfigOverrides => {
  return window.alloy("sendEvent", {
    renderDecisions: true,
    datastreamConfigOverrides: {
      ...datastreamConfigOverrides
    }
  });
};
const setConsent = datastreamConfigOverrides => {
  return window.alloy("setConsent", {
    consent: [
      {
        standard: "Adobe",
        version: "2.0",
        value: {
          collect: {
            val: "in"
          }
        }
      }
    ],
    datastreamConfigOverrides: {
      ...datastreamConfigOverrides
    }
  });
};
const getIdentity = datastreamConfigOverrides => {
  return window.alloy("getIdentity", {
    namespaces: ["ECID"],
    datastreamConfigOverrides: {
      ...datastreamConfigOverrides
    }
  });
};

const appendIdentityToUrl = datastreamConfigOverrides => {
  return window
    .alloy("appendIdentityToUrl", {
      url: "https://example.com",
      datastreamConfigOverrides: {
        ...datastreamConfigOverrides
      }
    })
    .then(url => console.log("URL with appended identity: ", url));
};

export default function ConfigOverrides() {
  const [error, setError] = useState("");
  const [overrides, setOverrides] = useState({ ...defaultOverrides });
  const overridesString = JSON.stringify(overrides, null, 2);
  const onTextareaChange = event => {
    try {
      const newOverrides = JSON.parse(event.target.value);
      setOverrides(newOverrides);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        "The text you just entered is not valid JSON. Try again.\n" + err
      );
    }
  };
  const addReportSuite = () => {
    console.log("Add report suite");
    setOverrides({
      ...overrides,
      analytics: {
        ...overrides.analytics,
        analyticsReportSuites: [
          ...((overrides.analytics || {}).analyticsReportSuites || []),
          ""
        ]
      }
    });
  };
  const resetOverrides = () => {
    setOverrides({ ...defaultOverrides });
  };
  const callWithOverrides = callback => () =>
    callback(overrides).catch(err => {
      console.error(err);
      setError("The request failed.\n" + err.toString());
    });
  return (
    <div>
      <h2>Overrides</h2>
      {error && (
        <div
          style={{
            margin: "8px",
            border: "1px solid red",
            borderRadius: "8px",
            padding: "8px"
          }}
        >
          <span
            role="img"
            aria-label="A siren, signifying something to be alerted by"
          >
            🚨
          </span>
          <pre style={{ wordWrap: "break-word" }}>{error}</pre>
        </div>
      )}
      <div style={{ margin: "8px" }}>
        <button type="button" onClick={addReportSuite}>
          Add report suite
        </button>
        <button type="button" onClick={resetOverrides}>
          Reset
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          flexWrap: "wrap-reverse",
          maxWidth: "875px"
        }}
      >
        <textarea
          style={{
            fontFamily: "monospace",
            boxSizing: "border-box"
          }}
          name="overrideEditor"
          id="overrideEditor"
          cols="50"
          rows="20"
          value={overridesString}
          onChange={onTextareaChange}
        ></textarea>
        <pre>
          <code>
            alloy("sendEvent",{" "}
            {JSON.stringify(
              { renderDecisions: true, datastreamConfigOverrides: overrides },
              null,
              2
            )}
            )
          </code>
        </pre>
      </div>
      <div style={{ margin: "8px" }}>
        <button type="button" onClick={callWithOverrides(sendEvent)}>
          Send Event
        </button>
        <button type="button" onClick={callWithOverrides(getIdentity)}>
          Get Identity
        </button>
        <button type="button" onClick={callWithOverrides(appendIdentityToUrl)}>
          Append Identity to URL
        </button>
        <button type="button" onClick={callWithOverrides(setConsent)}>
          Set Consent
        </button>
      </div>
    </div>
  );
}
