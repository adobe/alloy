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
import { server } from "@vitest/browser/context";

const { readFile } = server.commands;

export default async (config) => {
  const alloyBaseCode = await readFile("../../../../distTest/baseCode.min.js");
  const alloySrc = await readFile("../../../../dist/alloy.js");

  document.body.innerHTML = "Alloy Test Page";

  const alloyBaseCodeScriptTag = document.createElement("script");
  alloyBaseCodeScriptTag.textContent = alloyBaseCode;
  document.body.appendChild(alloyBaseCodeScriptTag);

  const alloyScriptTag = document.createElement("script");
  alloyScriptTag.textContent = alloySrc;
  document.body.appendChild(alloyScriptTag);

  if (config) {
    window.alloy("configure", config);
  }

  return window.alloy;
};
