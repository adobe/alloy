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
import build from "@adobe/reactor-sandbox/src/tasks/helpers/build.js";
import files from "@adobe/reactor-sandbox/src/tasks/constants/files.js";
import appendScript from "./appendScript.mjs";

export default async (container) => {
  const buildFiles = build({ container });
  const launchLibrary = buildFiles[`/${files.LAUNCH_LIBRARY_FILENAME}`];

  return appendScript(launchLibrary);
};
