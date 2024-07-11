import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";
import withScript from "./components/withScript";

function ActivityMapExtension() {
  useSendPageViewEvent();

  const countingButtonRef = useRef(null);
  const navigateToPageARef = useRef(null);
  const navigateToAdobeRef = useRef(null);

  useEffect(() => {
    let buttonClickCounter = 0;
    const changeButtonText = () => {
      buttonClickCounter++;
      if (countingButtonRef.current) {
        countingButtonRef.current.innerHTML = `Clicked ${buttonClickCounter} times`;
      }
    };

    const navigateToAdobe = () => {
      document.location = "https://adobe.com";
    };

    if (countingButtonRef.current) {
      countingButtonRef.current.addEventListener("click", changeButtonText);
    }
    if (navigateToAdobeRef.current) {
      navigateToAdobeRef.current.addEventListener("click", navigateToAdobe);
    }

    return () => {
      if (countingButtonRef.current) {
        countingButtonRef.current.removeEventListener(
          "click",
          changeButtonText,
        );
      }
      if (navigateToAdobeRef.current) {
        navigateToAdobeRef.current.removeEventListener(
          "click",
          navigateToAdobe,
        );
      }
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
        This page includes
        <a href="https://experienceleague.adobe.com/docs/analytics/implementation/appmeasurement-updates.html?lang=en">
          AppMeasurement version
        </a>
        2.23.0.
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
        <button
          id="counting-button"
          className="rounded-button"
          ref={countingButtonRef}
        >
          Button with Click Handler
        </button>
      </p>
      <p>
        <Link to="/page-a">
          <button
            className="rounded-button"
            id="anchor-button"
            ref={navigateToPageARef}
          >
            Button Wrapped in Anchor
          </button>
        </Link>
      </p>
      <p>
        <button className="rounded-button" id="nothing-button">
          Button Does Nothing
        </button>
      </p>
      <h3 id="navigate-to-adobe" ref={navigateToAdobeRef}>
        H3 with Click Handler
      </h3>
      <p>
        <input type="checkbox" id="checkbox" name="checkbox" />
        <label htmlFor="checkbox">Checkbox</label>
      </p>
      <p>
        <input type="radio" id="radio1" name="radio" />
        <label htmlFor="radio1">Radio 1</label>
      </p>
      <p>
        <input type="radio" id="radio2" name="radio" />
        <label htmlFor="radio2">Radio 2</label>
      </p>
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

export default withScript(ActivityMapExtension, "/s_code.js");
