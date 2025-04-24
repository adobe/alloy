import React, { useEffect } from "react";
import UnsafeContentSecurityPolicy from "./components/UnsafeContentSecurityPolicy";
import sendPageViewEvent from "./helpers/sendPageViewEvent";
import setupAlloy from "./helpers/setupAlloy";
import configureAlloy from "./helpers/configureAlloy";

const loadLaunch = () => {
  const script = document.createElement("script");
  script.src =
    "http://assets.adobedtm.com/launch-ENaa9d45a2136f487791ebc8420ec24dbe.min.js";
  script.async = true;
  document.body.appendChild(script);
};

export default function DualTag() {
  useEffect(() => {
    setupAlloy();
    configureAlloy();
    sendPageViewEvent();
    loadLaunch();
  }, []);

  return (
    <div>
      {/* Need less restrictive CSP for old libraries */}
      <UnsafeContentSecurityPolicy />
      <h1>Dual Tagging</h1>
      <p>
        This page loads a launch library containing Analytics, ECID, DIL, and
        Target.
      </p>
      <p>
        This is for testing interactions between alloy and the legacy libraries.
        In particular we are looking for conflicts in personalization, ecid, and
        id/dest syncs.
      </p>
    </div>
  );
}
