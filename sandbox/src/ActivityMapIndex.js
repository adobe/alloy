import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";
import withScript from "./components/withScript";

function ActivityMapIndex() {
  useSendPageViewEvent();

  useEffect(() => {
    let buttonClickCounter = 0;
    const changeButtonText = () => {
      buttonClickCounter++;
      let button = document.getElementById("counting-button");
      button.innerHTML = `Clicked ${buttonClickCounter} times`;
    };

    const navigateToAdobe = () => {
      document.location = "https://adobe.com";
    };

    const sendAPageView = () => {
      alloy("sendEvent", {
        xdm: {
          eventType: "web.webpagedetails.pageViews",
          web: {
            webPageDetails: {
              name: "Page View",
              pageViews: {
                value: 1,
              },
            },
          },
        },
      });
    };

    document
      .getElementById("counting-button")
      .addEventListener("click", changeButtonText);
    document
      .getElementById("send-page-view")
      .addEventListener("click", sendAPageView);
    document
      .getElementById("navigate-to-adobe")
      .addEventListener("click", navigateToAdobe);

    return () => {
      document
        .getElementById("counting-button")
        .removeEventListener("click", changeButtonText);
      document
        .getElementById("send-page-view")
        .removeEventListener("click", sendAPageView);
      document
        .getElementById("navigate-to-adobe")
        .removeEventListener("click", navigateToAdobe);
    };
  }, []);

  return (
    <div id="maindiv">
      <ContentSecurityPolicy />
      <h1>ActivityMap Test Page</h1>
      <a href="https://www.adobe.com/about-adobe/contact.html">
        <span>
          <img
            src="AdobeLogo.svg"
            id="logo"
            width="50"
            height="50"
            alt="Adobe, Inc."
          />
        </span>
      </a>
      <p>
        This page includes the Web SDK with ActivityMap click tracking support.
      </p>
      <h2>Internal Links</h2>
      <p>
        <Link to="/activityMapPageA">Page A</Link>
      </p>
      <p>
        <a href="">Nowhere</a>
      </p>
      <h2>External Links</h2>
      <p>
        <a href="https://adobe.com">Adobe.com</a>
      </p>
      <p>
        <a href="https://chrome.google.com/webstore/detail/activity-map/iegkaadihdhfjcllhcpkfjflfcfhoopf">
          ActivityMap Extension
        </a>
      </p>
      <h2>Download Links</h2>
      <p>
        <a href="test.zip?test=123">test.zip</a>
      </p>
      <h2>Misc Links</h2>
      <p>
        <button id="counting-button" className="rounded-button">
          Button with Click Handler that navigates to Page A
        </button>
      </p>
      <p>
        <button id="send-page-view" className="rounded-button">
          Button with Click Handler that sends page view
        </button>
      </p>
      <p>
        <Link to="/page-a">
          <button className="rounded-button" id="anchor-button">
            Button Wrapped in Anchor
          </button>
        </Link>
      </p>
      <p>
        <button className="rounded-button" id="nothing-button">
          Button Does Nothing
        </button>
      </p>
      <h3 id="navigate-to-adobe">H3 with Click Handler</h3>
      <p>
        <input type="checkbox" id="checkbox" name="checkbox" />
        <label htmlFor="checkbox">Checkbox</label>
      </p>
      <h3>Different Input Types</h3>
      <p>
        <input
          type="image"
          src="AdobeLogo.svg"
          width="40"
          height="40"
          id="form-input-image"
          value="Send Request"
        />
      </p>
      <p>
        <input type="submit" id="form-input" value="Send Request" />
      </p>
    </div>
  );
}

export default withScript(ActivityMapIndex, "/s_code.js");
