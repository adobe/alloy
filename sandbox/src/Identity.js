/*
 Copyright 2022 Adobe. All rights reserved.
 This file is licensed to you under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License. You may obtain a copy
 of the License at http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under
 the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 OF ANY KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
 */

import React, { useState } from "react";

const getIdentity = setIdentity => () => {
  window.alloy("getIdentity", { namespaces: ["ECID"] }).then(function(result) {
    if (result.identity) {
      console.log(
        "Sandbox: Get Identity command has completed.",
        result.identity.ECID
      );
      setIdentity(result.identity.ECID);
    } else {
      console.log(
        "Sandbox: Get Identity command has completed but no identity was provided in the result (possibly due to lack of consent)."
      );
      setIdentity("No Identity");
    }
  });
};

const appendIdentityToUrl = event => {
  const url = event.target.href;
  event.preventDefault();
  window.alloy("appendIdentityToUrl", { url }).then(({ url }) => {
    document.location = url;
  });
};

export default function Identity() {
  const [identity, setIdentity] = useState("");

  return (
    <div>
      <h1>Identity</h1>
      <section>
        <h2>Get Identity</h2>
        <div>
          <button onClick={getIdentity(setIdentity)}>Get ECID</button>
          <h3>{identity}</h3>
        </div>
      </section>
      <section>
        <a href="https://alloyio2.com/identity" onClick={appendIdentityToUrl}>
          Cross domain linked identity.
        </a>
      </section>
    </div>
  );
}
