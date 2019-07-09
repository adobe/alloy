import React from "react";
import { withRouter } from "react-router-dom";

let previousPath;
function HomeWithHistory({ history }) {

  history.listen((loc) => {
    if (loc.pathname !== previousPath) {
      const instanceName = loc.pathname.includes("orgTwo") ? "organizationTwo" : "alloy";
      window[instanceName]("event", {
        eventType: "web.webpagedetails.pageViews",
        data: {
          "xdm:URL": [window.location.href],
          "xdm:name": [loc.pathname.substring(1)]
        }
      });
    }
    previousPath = loc.pathname;
  });

  const visitDoc = ev => {
    window.alloy("event", {
      eventType: "web.webinteraction.linkClicks",
      data: {
        "activitystreams:href": [ev.target.href],
        "activitystreams:name": [ev.target.name],
        "activitystreams:mediaType": "text/html",
      }
    });
  };

  const copyBaseCode = ev => {
    window.alloy("event", {
      eventType: "web.webinteraction.linkClicks",
      data: {
        "activitystreams:href": ["https://launch.gitbook.io/adobe-experience-platform-web-sdk/"],
        "activitystreams:name": ["copyBaseCode"],
        "activitystreams:mediaType": "text/html",
      }
    });
  };

  return (
      <div>
        <section>  
          <div className="container">
            <h2>Some awesome default content</h2>
            <br/>
          </div>
        </section>

        <section> 
          <div>
            <h1>Alloy: Getting Started</h1>
            <h3>Installation</h3>
            <p>
            The first step in implemented the Adobe Experience Platform SDK is to copy and paste the following
            "base code" as high as possible in the head tag of your HTML:
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
            The base code, by default, creates a global function named alloy. You will use this function to interact with the SDK.
            If you would like to name the global function something else, you may change the alloy name as follows:
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
            With this change made, the global function would be named mycustomname instead of alloy.
            This base code, in addition to creating a global function, also loads additional code contained <br/>
            within an external file (alloy.js) hosted on a server. By default, this code is loaded asynchronously<br/>
            to allow your webpage to be as performant as possible. This is the recommended implementation.
            </p>
            <a
              href="https://launch.gitbook.io/adobe-experience-platform-web-sdk/"
              onClick={visitDoc} name="Alloy Public Documentation">Read full documentation</a>
          </div>
        </section>
      </div>
    );
}

const Home = withRouter(HomeWithHistory);
export default Home;
