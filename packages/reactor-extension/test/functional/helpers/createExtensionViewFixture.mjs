/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { RequestMock } from "testcafe";

const WEB_SERVER_PORT = process.env.WEB_SERVER_PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const preventSpecificErrorsFromFailingTestsPath = path.join(
  __dirname,
  "clientScripts/preventSpecificErrorsFromFailingTests.js",
);

const extensionBridgeMockContent = fs.readFileSync(
  path.join(__dirname, "clientScripts/extensionBridgeMock.js"),
);

const extensionBridgeRequestMock = RequestMock()
  .onRequestTo(
    "https://assets.adobedtm.com/activation/reactor/extensionbridge/extensionbridge.min.js",
  )
  .respond(extensionBridgeMockContent);

const createExtensionViewFixture = ({
  title,
  viewPath,
  requiresAdobeIOIntegration = false,
  requestHooks = [],
  only = false,
}) => {
  let fixt = (only ? fixture.only : fixture)(title)
    .page(`http://localhost:${WEB_SERVER_PORT}/${viewPath}`)
    .requestHooks(extensionBridgeRequestMock, ...requestHooks)
    .clientScripts(preventSpecificErrorsFromFailingTestsPath);

  if (requiresAdobeIOIntegration) {
    fixt = fixt.meta("requiresAdobeIOIntegration", true);
  }

  return fixt;
};

export default createExtensionViewFixture;
