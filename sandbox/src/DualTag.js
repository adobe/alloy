/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
