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

import getUrlParameter from "./getUrlParameter";

export default ({
  instanceName = "alloy",
  datastreamId,
  orgId,
  edgeDomain,
  thirdPartyCookiesEnabled,
  targetMigrationEnabled,
  clickCollectionEnabled,
  defaultConsent,
  personalizationStorageEnabled = true,
  onBeforeEventSend = (options) => {
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
} = {}) => {
  window[instanceName]("configure", {
    defaultConsent: defaultConsent || getUrlParameter("defaultConsent") || "in",
    thirdPartyCookiesEnabled:
      thirdPartyCookiesEnabled != null ? thirdPartyCookiesEnabled : true,
    edgeDomain:
      edgeDomain || window.location.host.indexOf("alloyio.com") !== -1
        ? "firstparty.alloyio.com"
        : undefined,
    edgeBasePath: getUrlParameter("edgeBasePath") || "ee",
    datastreamId:
      datastreamId ||
      getUrlParameter("datastreamId") ||
      getUrlParameter("edgeConfigId") ||
      "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
    orgId: orgId || "5BFE274A5F6980A50A495C08@AdobeOrg", // UnifiedJS QE Only
    debugEnabled: true,
    idMigrationEnabled: !(getUrlParameter("idMigrationEnabled") === "false"),
    prehidingStyle: ".personalization-container { opacity: 0 !important }",
    onBeforeEventSend,
    personalizationStorageEnabled,
    clickCollection: {
      filterClickDetails: (options) => {
        // eslint-disable-next-line no-console
        console.log("options", options);

        const x = options.xdm;
        const d = options.data;
        const { webInteraction = {} } = x?.web || {};

        if (webInteraction.name === "Large Payload") {
          x.web.webInteraction.name = "changed link name";
          d.custom = "custom field for changed link name";

          return true;
        }

        if (webInteraction.name === "Personalization") {
          return false;
        }

        if (webInteraction.URL === "https://alloyio.com/download.zip") {
          return false;
        }

        return true;
      },
    },
    targetMigrationEnabled:
      targetMigrationEnabled != null ? targetMigrationEnabled : true,
    clickCollectionEnabled:
      clickCollectionEnabled != null ? clickCollectionEnabled : true,
  });
};
