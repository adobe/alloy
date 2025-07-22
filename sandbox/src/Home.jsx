/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import useSendPageViewEvent from "./helpers/useSendPageViewEvent";

const getIdentity = () => {
  window.alloy("getIdentity", { namespaces: ["ECID"] }).then((result) => {
    if (result.identity) {
      console.log(
        "Sandbox: Get Identity command has completed.",
        result.identity.ECID,
      );
    } else {
      console.log(
        "Sandbox: Get Identity command has completed but no identity was provided in the result (possibly due to lack of consent).",
      );
    }
  });
};

const getLibraryInfo = () => {
  window.alloy("getLibraryInfo");
};

export default function Home() {
  useEffect(() => {
    window.__alloyMonitors = [];
    window.__alloyMonitors.push({
      onContentRendering(data) {
        console.log("Alloy Content Rendering");
        console.log("data", data.status, data);
      },
      onContentHiding(data) {
        console.log("Alloy Content Hiding");
        console.log("data", data.status);
      },
      onInstanceCreated(data) {
        console.log("Alloy Instance Created");
        console.log(data.instanceName);
        console.log(data.instance);
      },
      onInstanceConfigured(data) {
        console.log("Alloy Instance Configured");
        console.log(JSON.stringify(data.config, null, 2));
        const { getLinkDetails } = data;
        const listOfLinks = document.links;
        setTimeout(async () => {
          console.log(
            `Will now print link details for ${listOfLinks.length} links`,
          );
          for (let i = 0; i < listOfLinks.length; i += 1) {
            const linkDetails = getLinkDetails(listOfLinks[i]);
            console.log("link details", linkDetails);
          }
        }, 1000);
      },
    });
  }, []);

  useAlloy({
    options: { keepExistingMonitors: true },
  });
  useSendPageViewEvent();

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Home</h1>
      <section>
        <h2>Get Identity</h2>
        <div>
          <button onClick={getIdentity}>Get ECID</button>
        </div>
      </section>
      <section>
        <h2>Library Info</h2>
        <div>
          <button onClick={getLibraryInfo}>Get Library Info</button>
        </div>
      </section>
    </div>
  );
}
