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
import React, { useEffect, useState } from "react";

const useAlloyVersion = (instanceName = "alloy") => {
  const [version, setVersion] = useState("0.0.0");
  useEffect(() => {
    window[instanceName]("getLibraryInfo").then(
      ({ libraryInfo: { version } }) => {
        setVersion(version);
      }
    );
  }, [instanceName]);
  return version;
};

/**
 * Display the Alloy version in a footer in the bottom right.
 */
export default () => {
  const alloyVersion = useAlloyVersion(window.__alloyNS[0]);
  return (
    <div
      style={{
        bottom: 0,
        fontFamily: "monospace",
        margin: "4px",
        padding: "0",
        opacity: 0.4,
        position: "fixed",
        right: 0,
        size: "0.8rem",
        userSelect: "none"
      }}
    >
      {alloyVersion}
    </div>
  );
};
