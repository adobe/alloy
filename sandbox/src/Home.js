import React from "react";
import { withRouter } from "react-router-dom";

let previousPath;
function HomeWithHistory({ history }) {
  history.listen(loc => {
    if (loc.pathname !== previousPath) {
      const instanceName = loc.pathname.includes("orgTwo")
        ? "organizationTwo"
        : "alloy";
      window[instanceName]("event", {
        viewStart: true,
        xdm: {
          eventType: "page-view"
        }
      });
    }
    previousPath = loc.pathname;
  });

  const executeOptInCommand = purposes => () => {
    window
      .alloy("optIn", {
        purposes
      })
      .catch(console.error);
  };

  const getDecisions = () => {
    window
      .alloy("getDecisions", {
        scopes: ["alloy-location-1", "alloy-location-2"]
      })
      .then((decisions = []) => {
        decisions.forEach(decision => {
          const domLocation = document.querySelector(`.${decision.scope}`);
          domLocation.innerHTML = decision.items[0].data.content;
        });
      });
  };

  return (
    <div>
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
            <button onClick={getDecisions}>Render Available Decisions</button>
          </div>
        </div>
      </section>

      <section>
        <div>
          <h2>Opt-In</h2>
          <p>To test Opt-In on load, set the `optInEnabled` config to true.</p>
          <div>
            <button onClick={executeOptInCommand("all")}>
              OptIn to all purposes
            </button>
            <span>should trigger queued up commands.</span>
          </div>
          <div>
            <button onClick={executeOptInCommand("none")}>
              OptIn to no purposes
            </button>
            <span>should stop most commands and throw an error.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

const Home = withRouter(HomeWithHistory);
export default Home;
