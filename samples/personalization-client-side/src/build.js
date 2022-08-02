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
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

require("dotenv").config({ path: path.resolve(process.cwd(), "..", ".env") });
const { EDGE_CONFIG_ID, ORGANIZATION_ID, FPID, demoDecisionScopeName } =
  process.env;

const template = fs.readFileSync(
  path.resolve(path.join(__dirname, "index.handlebars")),
  "utf-8"
);

const renderTemplate = Handlebars.compile(template);

const html = renderTemplate({
  edgeConfigId: EDGE_CONFIG_ID,
  orgId: ORGANIZATION_ID,
  FPID,
  demoDecisionScopeName,
});

// Write to build folder. Copy the built file and deploy
fs.writeFile(
  path.join(__dirname, "..", "public", "index.html"),
  html,
  (err) => {
    if (err) console.log(err);
    console.log("File written succesfully");
  }
);
