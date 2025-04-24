/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable no-underscore-dangle */

// eslint-disable-next-line import/no-relative-packages
import initializeAlloy from "../../../src/baseCode/index";
import getUrlParameter from "./getUrlParameter";
import includeScript from "./includeScript";

export default ({ instanceNames = ["alloy"] } = {}) => {
  delete window.__alloyMonitors;
  delete window.__alloyNS;

  instanceNames.forEach((instanceName) => {
    delete window[instanceName];
  });

  initializeAlloy(window, instanceNames);

  if (getUrlParameter("includeVisitor") === "true") {
    includeScript(
      "https://github.com/Adobe-Marketing-Cloud/id-service/releases/download/4.5.1/visitorapi.min.js",
    ).then(() => {
      // eslint-disable-next-line no-undef
      Visitor.getInstance("53A16ACB5CC1D3760A495C99@AdobeOrg", {
        doesOptInApply: getUrlParameter("legacyOptIn") === "true",
      });
      // Alloy only looks for window.Visitor when it initially loads, so only load Alloy after Visitor loaded.
      includeScript("/alloy.js");
    });
  } else {
    includeScript("/alloy.js");
  }
};
