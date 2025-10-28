import React from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import NotificationPermissionsPanel from "./components/PushNotifications/NotificationPermissionsPanel";
import useAlloy from "./helpers/useAlloy";

const log = (message) => {
  const output = document.getElementById("output");
  const entry = document.createElement("div");
  entry.textcontent = message;
  output.appendChild(entry);
  console.log(message);
};

export default function Advertising() {
  useAlloy({
    configurations: {
      alloy: {
        debugEnabled: true,
        edgeConfigId: "test-edge-config",
        orgId: "test@AdobeOrg",
        // Updated advertising configuration with proper settings
        advertising: {
          // ID5 Configuration
          id5PartnerId: "1650",

          // RampID/LiveRamp Configuration
          liverampScriptPath:
            "https://ats-wrapper.privacymanager.io/ats-modules/69584196-4cc8-4859-ae5e-7441332d2695/ats.js",

          // Display campaign configuration
          viewThruEnabled: true,
        },
      },
    },
  });

  return (
    <div>
      <ContentSecurityPolicy />
      <NotificationPermissionsPanel />
      <h1>Advertising</h1>
      <section>
        <div style={{ margin: "20px 0" }}>
          <button
            id="checkBtn"
            onClick={() => {
              log("checking component registration...");

              alloy("getlibraryinfo")
                .then(function (info) {
                  log("components: " + info.components.join(", "));
                  log("commands: " + info.commands.join(", "));

                  if (info.components.includes("Advertising")) {
                    log("✅ Advertising component is registered!");
                  } else {
                    log("❌ Advertising component is NOT registered");
                  }

                  if (info.commands.includes("sendAdConversion")) {
                    log("✅ sendAdConversion command is available!");
                  } else {
                    log("❌ sendAdConversion command is NOT available");
                  }
                })
                .catch(function (error) {
                  log("❌ Error: " + error.message);
                });
            }}
          >
            Check Component Registration
          </button>
          <button
            id="testBtn"
            onClick={() => {
              log("Testing sendAdConversion command...");

              alloy("sendAdConversion", {
                viewThruEnabled: true,
                clickThruEnabled: false,
              })
                .then(function (result) {
                  log("✅ Ad conversion successful!");
                  log("Result: " + JSON.stringify(result));
                })
                .catch(function (error) {
                  log("❌ Error sending ad conversion: " + error.message);
                });
            }}
          >
            Test Ad Conversion
          </button>
          <button
            id="getIdsBtn"
            onClick={() => {
              log("Retrieving advertising identities...");

              alloy("getAdvertisingIdentity")
                .then(function (result) {
                  log("✅ Advertising identities retrieved!");
                  log("IDs: " + JSON.stringify(result));

                  if (result.id5_id) {
                    log("ID5 ID: " + result.id5_id);
                  }

                  if (result.ramp_id) {
                    log("RampID: " + result.ramp_id);
                  }

                  if (result.surfer_id) {
                    log("Surfer ID: " + result.surfer_id);
                  }
                })
                .catch(function (error) {
                  log(
                    "❌ Error retrieving advertising identities: " +
                      error.message,
                  );
                });
            }}
          >
            Get Advertising IDs
          </button>
        </div>

        <div
          id="output"
          style={{
            marginTop: "20px",
            border: "1px solid #ccc",
            padding: "10px",
            minHeight: "200px",
          }}
        ></div>
      </section>
    </div>
  );
}
