/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from "react";
import { Helmet } from "react-helmet";

const Basecode = () => {
  return (
    <Helmet>
      <script nonce="321">
        {`!function(e,a,n,t){var i=e.head;if(i){
        if (a) return;
        var o=e.createElement("style");
        o.setAttribute("nonce", "321");
        o.id="alloy-prehiding",o.innerText=n,i.appendChild(o),
        setTimeout(function(){o.parentNode&&o.parentNode.removeChild(o)},t)}}
        (document, document.location.href.indexOf("mboxEdit") !== -1, ".personalization-container { opacity: 0 !important }", 3000);`}
      </script>

      <script nonce="321">
        {`!function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
        []).push(o),n[o]=function(){var u=arguments;return new Promise(
        function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}
        (window,["alloy", "organizationTwo"]);`}
      </script>

      <script nonce="321">
        {`function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results === null
          ? ""
          : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

      function includeScript(src) {
        return new Promise(function(resolve, reject) {
          var tag = document.createElement("script");
          tag.type = "text/javascript";
          tag.async = true;
          tag.addEventListener("load", function() {
            resolve();
          });
          tag.nonce = "321";
          tag.src = src;
          document.head.appendChild(tag);
        });
      }

      if (getUrlParameter("includeVisitor") === "true") {
        includeScript(
          "https://github.com/Adobe-Marketing-Cloud/id-service/releases/download/4.5.1/visitorapi.min.js"
        ).then(function() {
          Visitor.getInstance("53A16ACB5CC1D3760A495C99@AdobeOrg", {
            doesOptInApply: getUrlParameter("legacyOptIn") === "true"
          });
          // Alloy only looks for window.Visitor when it initially loads, so only load Alloy after Visitor loaded.
          includeScript("https://cdn1.adoberesources.net/alloy/2.5.0/alloy.min.js");
        });
      } else {
        includeScript("https://cdn1.adoberesources.net/alloy/2.5.0/alloy.min.js");
      }`}
      </script>

      <script nonce="321">
        {`alloy("configure", {
        defaultConsent: getUrlParameter("defaultConsent") || "in",
        edgeDomain:
          location.host.indexOf("alloyio.com") !== -1
            ? "firstparty.alloyio.com"
            : undefined,
        edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
        orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
        debugEnabled: true,
        idMigrationEnabled: !(
          getUrlParameter("idMigrationEnabled") === "false"
        ),
        prehidingStyle: ".personalization-container { opacity: 0 !important }",
        onBeforeEventSend: function(options) {
          const xdm = options.xdm;
          const data = options.data;
          const titleParam = getUrlParameter("title");
          if (titleParam) {
            xdm.web.webPageDetails.name = titleParam;
          }
          const campaignParam = getUrlParameter("campaign");
          if (campaignParam) {
            data.campaign = campaignParam;
          }
        }
      });

      // For Testing multiple instances.
      // We use a different orgId and edgeConfigId.
      organizationTwo("configure", {
        edgeConfigId: "9999999",
        orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
        debugEnabled: true,
        clickCollectionEnabled: false
      });`}
      </script>
    </Helmet>
  );
};

export { Basecode };
