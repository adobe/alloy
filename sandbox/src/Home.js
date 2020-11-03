import React from "react";
import { withRouter } from "react-router-dom";
import ContentSecurityPolicy from "./ContentSecurityPolicy";

let previousPath;
function HomeWithHistory({ history }) {
  history.listen(loc => {
    if (loc.pathname !== previousPath) {
      const instanceName = loc.pathname.includes("orgTwo")
        ? "organizationTwo"
        : "alloy";
      window[instanceName]("sendEvent", {
        renderDecisions: true,
        xdm: {
          eventType: "page-view"
        }
      });
    }
    previousPath = loc.pathname;
  });

  const getDecisions = () => {
    window
      .alloy("sendEvent", {
        renderDecisions: true,
        decisionScopes: ["alloy-location-1", "alloy-location-2"],
        xdm: {
          // Demonstrates overriding automatically collected data
          device: {
            screenHeight: 1
          }
        }
      })
      .then(({ decisions = [] }) => {
        decisions.forEach(decision => {
          const domLocation = document.querySelector(`.${decision.scope}`);
          domLocation.innerHTML = decision.items[0].data.content;
        });
      });
  };

  const getIdentity = () => {
    window
      .alloy("getIdentity", { namespaces: ["ECID"] })
      .then(function(result) {
        console.log(
          "Sandbox: Get Identity command has completed.",
          result.identity.ECID
        );
      });
  };

  const sendDataToSecondaryDataset = () => {
    window.alloy("sendEvent", {
      datasetId: "5eb9aaa6a3b16e18a818e06f"
    });
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <section>
        <div className="personalization-container">
          <h2>Some awesome default content.</h2>
          <div>
            All visitors qualify for the offer{" "}
            <span role="img" aria-label="">
              👆
            </span>
          </div>
          <br />
        </div>

        <div className="personalization-decisions">
          <div className="alloy-location-1">
            <h2>Placeholder for Decision 1</h2>
          </div>
          <div className="alloy-location-2">
            <h2>Placeholder for Decision 2</h2>
          </div>
          <div>
            <button onClick={getDecisions}>
              Send Event, Fetch & Render Decisions
            </button>
          </div>
        </div>
      </section>
      <section>
        <h1>Get Identity</h1>
        <div>
          <button onClick={getIdentity}>Get ECID</button>
        </div>
      </section>
      <section>
        <h1>Collect data by overriding the Dataset configured in Config UI</h1>
        <div>
          <button onClick={sendDataToSecondaryDataset}>
            Send Event to Secondary Dataset
          </button>
        </div>
      </section>
    </div>
  );
}

const Home = withRouter(HomeWithHistory);
export default Home;
