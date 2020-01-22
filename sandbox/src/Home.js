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
    </div>
  );
}

const Home = withRouter(HomeWithHistory);
export default Home;
