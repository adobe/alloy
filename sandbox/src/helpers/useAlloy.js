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

import { useEffect } from "react";

// eslint-disable-next-line import/no-relative-packages
import initializeAlloy from "../../../src/baseCode/index";
import getUrlParameter from "./getUrlParameter";
import includeScript from "./includeScript";

const setup = ({
  instanceNames,
  options: { keepExistingMonitors = false, onAlloySetupCompleted },
}) => {
  if (!keepExistingMonitors) {
    delete window.__alloyMonitors;
  }

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
      // eslint-disable-next-line import/no-relative-packages
      return import("../../../src/standalone");
    });
  } else {
    // eslint-disable-next-line import/no-relative-packages
    import("../../../src/standalone");
  }

  if (onAlloySetupCompleted) {
    onAlloySetupCompleted();
  }
};

const defaultConfiguration = {
  datastreamId:
    getUrlParameter("datastreamId") ||
    getUrlParameter("edgeConfigId") ||
    "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg", // UnifiedJS QE Only
  debugEnabled: true,
  edgeDomain:
    window.location.host.indexOf("alloyio.com") !== -1
      ? "firstparty.alloyio.com"
      : undefined,
  edgeBasePath: getUrlParameter("edgeBasePath") || "ee",
  onBeforeEventSend: (options) => {
    const x = options.xdm;
    const d = options.data;
    const titleParam = getUrlParameter("title");
    if (titleParam) {
      x.web.webPageDetails.name = titleParam;
    }
    const campaignParam = getUrlParameter("campaign");
    if (campaignParam) {
      d.campaign = campaignParam;
    }

    const _unifiedjsqeonly = x._unifiedjsqeonly || {};
    _unifiedjsqeonly.rawTimestamp = new Date().getTime();
    x._unifiedjsqeonly = _unifiedjsqeonly;
    return true;
  },
  thirdPartyCookiesEnabled: true,
  targetMigrationEnabled: true,
  clickCollectionEnabled: true,
  defaultConsent: getUrlParameter("defaultConsent") || "in",
  personalizationStorageEnabled: true,
};

const configureInstance = (instanceName, configuration = {}) => {
  window[instanceName]("configure", {
    ...defaultConfiguration,
    ...configuration,
  });
};

export default ({
  instanceNames = ["alloy"],
  configurations = {},
  options = {},
} = {}) => {
  useEffect(() => {
    setup({ instanceNames, options });
    Object.entries(instanceNames).forEach(([, instanceName]) => {
      configureInstance(instanceName, configurations[instanceName]);
    });
  }, []);
};
