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

  const makeOptInCommand = purposes => () => {
    window
      .alloy("optIn", {
        purposes
      })
      .catch(console.error);
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

        <div className="personalization-container-2">
          <h2>Some more awesome default content.</h2>
          You only qualify for the offer{" "}
          <span role="img" aria-label="">
            👆
          </span>{" "}
          <br></br>
          if you qualify for the <strong>`Shopping Cart Visitor`</strong>{" "}
          Segment. (ID: 16754409):
        </div>
      </section>

      <section>
        <div>
          <h2>Opt-In</h2>
          <p>To test Opt-In on load, set the `optInEnabled` config to true.</p>
          <div>
            <button onClick={makeOptInCommand("all")}>
              OptIn to all purposes
            </button>
            <span>should trigger queued up commands.</span>
          </div>
          <div>
            <button onClick={makeOptInCommand("none")}>
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
