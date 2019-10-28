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
          eventType: "page-view",
          url: window.location.href,
          name: loc.pathname.substring(1)
        }
      });
    }
    previousPath = loc.pathname;
  });

  const visitDoc = ev => {
    window.alloy("event", {
      xdm: {
        eventType: "visit-doc",
        "activitystreams:href": ev.target.href,
        "activitystreams:name": ev.target.name,
        "activitystreams:mediaType": "text/html"
      }
    });
  };

  const copyBaseCode = ev => {
    window.alloy("event", {
      xdm: {
        eventType: "copy-base-code",
        "activitystreams:href":
          "https://launch.gitbook.io/adobe-experience-platform-web-sdk/",
        "activitystreams:name": "copyBaseCode",
        "activitystreams:mediaType": "text/html"
      }
    });
  };

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
          <h2>Some awesome default content</h2>
          <br />
        </div>
      </section>

      <section>
        <div>
          <h1>Getting Started with Alloy</h1>
          <h3>Installation</h3>
          <p>
            The first step in implemented the Adobe Experience Platform SDK is
            to copy and paste the following "base code" as high as possible in
            the head tag of your HTML:
          </p>
          <pre>
            <code>
              {`
                <script>
                  !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
                  []).push(o),n[o]=function(){var u=arguments;return new Promise(
                  function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}
                  (window,["alloy"]);
                </script>
                <script src="alloy.js" async></script>
              `}
            </code>
          </pre>
          <button onClick={copyBaseCode}>Copy Base Code</button>

          <p>
            The base code, by default, creates a global function named alloy.
            You will use this function to interact with the SDK. If you would
            like to name the global function something else, you may change the
            alloy name as follows:
          </p>
          <pre>
            <code>
              {`
                <script>
                  !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
                  []).push(o),n[o]=function(){var u=arguments;return new Promise(
                  function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}
                  (window,["mycustomname"]);
                </script>
                <script src="alloy.js" async></script>
              `}
            </code>
          </pre>
          <p>
            With this change made, the global function would be named
            mycustomname instead of alloy. This base code, in addition to
            creating a global function, also loads additional code contained{" "}
            <br />
            within an external file (alloy.js) hosted on a server. By default,
            this code is loaded asynchronously to allow your webpage to be as
            performant as possible. This is the recommended implementation.
          </p>
          <a
            href="https://launch.gitbook.io/adobe-experience-platform-web-sdk/"
            onClick={visitDoc}
            name="Alloy Public Documentation"
          >
            Read full documentation
          </a>

          <div>
            <h2>Opt-In</h2>
            <p>
              To test Opt-In on load, set the `optInEnabled` config to true.
            </p>
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
        </div>
      </section>
    </div>
  );
}

const Home = withRouter(HomeWithHistory);
export default Home;
