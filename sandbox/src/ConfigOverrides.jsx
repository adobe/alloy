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

const sendEvent = configuration => {
  window.alloy("sendEvent", {
    renderDecisions: true,
    configuration: {
      ...configuration
    }
  });
};
const setConsent = configuration => {
  window.alloy("setConsent", {
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
    configuration: {
      ...configuration
    }
  });
};
const getIdentity = configuration => {
  window.alloy("getIdentity", {
    namespaces: ["ECID"],
    configuration: {
      ...configuration
    }
  });
};

const appendIdentityToUrl = configuration => {
  window.alloy("appendIdentityToUrl", {
    url: "https://example.com",
    configuration: {
      ...configuration
    }
  }).then(url => console.log("URL with appended identity: ", url));
};

export default function ConfigOverrides() {
  const [isValidJson, setIsValidJson] = useState(true);
  const [overrides, setOverrides] = useState({ ...defaultOverrides });
  const overridesString = JSON.stringify(overrides, null, 2);
  const onTextareaChange = event => {
    try {
      const newOverrides = JSON.parse(event.target.value);
      setOverrides(newOverrides);
      setIsValidJson(true);
    } catch (err) {
      console.error(err);
      setIsValidJson(false);
    }
  };
  const textareaStyles = {
    fontFamily: "monospace",
    boxSizing: "border-box"
  };
  if (!isValidJson) {
    textareaStyles.border = "1px solid red";
  }
  const addReportSuite = () => {
    console.log("Add report suite");
    setOverrides({
      ...overrides,
      identity: {
        ...overrides.configuration.identity,
        analyticsReportSuites: [
          ...overrides.configuration.identity.analyticsReportSuites,
          ""
        ]
      }
    });
  };
  const resetOverrides = () => {
    setOverrides({ ...defaultOverrides });
  };
  const callWithOverrides = callback => () => callback(overrides);
  return (
    <div>
      <h2>Overrides</h2>
      {!isValidJson && (
        <div style={{ margin: "8px" }}>
          <span
            role="img"
            aria-label="A siren, signifying something to be alerted by"
          >
            🚨
          </span>{" "}
          The text you just entered is not valid JSON. Try again.{" "}
          <span
            role="img"
            aria-label="A siren, signifying something to be alerted by"
          >
            🚨
          </span>
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
          style={textareaStyles}
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
              { renderDecisions: true, configuration: overrides },
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
        <button type="button" onClick={callWithOverrides(appendIdentityToUrl)}>Append Identity to URL</button>
        <button type="button" onClick={callWithOverrides(setConsent)}>
          Set Consent
        </button>
      </div>
    </div>
  );
}
