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
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const adobeLink = () => {
  window.alloy("sendEvent", {
    documentUnloading: true,
    xdm: {
      "activitystreams:href": "http://www.adobe.com"
    }
  });
};

export default function Links() {
  useSendPageViewEvent();
  return (
    <div>
      <ContentSecurityPolicy />
      <Heading level={1}>Links</Heading>
      <p>
        This page shows a few different ways link clicks can be handled in
        Alloy.
      </p>
      <p>
        When clicking on this <a href="https://example.com">exit link</a>, Alloy
        records and transmits an exit-link web interaction event.
      </p>
      <p>
        When clicking on this{" "}
        <a href="download.zip" target="_blank">
          download link
        </a>
        , Alloy records and transmits a download-link web interaction event.
      </p>
      <p>
        When clicking on this{" "}
        <a onClick={adobeLink} href="http://www.adobe.com">
          custom link
        </a>
        , Alloy is instructed to collect a custom event through a sendBeacon
        call (in browsers that support beacons).
      </p>
      <p>
        In addition when clicking on any of the internal links (e.g. navigation
        menu), Alloy records and transmits a web interaction link (of type
        other) click event.
      </p>
      <br />
      <i>
        <b>TIP:</b>&nbsp;&nbsp;You can view the source of this page to gain more
        insight on how the different links work.
      </i>
    </div>
  );
}
