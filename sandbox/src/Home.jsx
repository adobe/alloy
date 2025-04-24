/* eslint-disable no-console */

import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import configureAlloy from "./helpers/configureAlloy";
import sendPageViewEvent from "./helpers/sendPageViewEvent";
import setupAlloy from "./helpers/setupAlloy";

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
    setupAlloy();
    configureAlloy();
    sendPageViewEvent();
  }, []);

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
