import React from "react";
import { Heading } from "@adobe/react-spectrum";
import UnsafeContentSecurityPolicy from "./components/UnsafeContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const loadLaunch = () => {
  const script = document.createElement("script");
  script.src =
    "http://assets.adobedtm.com/launch-ENaa9d45a2136f487791ebc8420ec24dbe.min.js";
  script.async = true;
  document.body.appendChild(script);
};

export default () => {
  useSendPageViewEvent();
  return (
    <div>
      {/* Need less restrictive CSP for old libraries */}
      <UnsafeContentSecurityPolicy />
      {loadLaunch()}
      <Heading level={1}>Dual Tagging</Heading>
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
};
