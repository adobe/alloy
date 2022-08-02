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
const path = require("path");

require("dotenv").config({
  path: path.resolve(process.cwd(), "..", ".env"),
});

const express = require("express");
const cookieParser = require("cookie-parser");

const {
  createAepEdgeClient,
  createIdentityPayload,
} = require("aep-edge-samples-common/aepEdgeClient");

const {
  loadHandlebarsTemplate,
} = require("aep-edge-samples-common/templating");

const { isString } = require("@adobe/target-tools");
const {
  TYPE_STATE_STORE,
  getAepEdgeClusterCookie,
} = require("aep-edge-samples-common");
const {
  requestAepEdgePersonalization,
} = require("aep-edge-samples-common/personalization");
const {
  saveAepEdgeCookies,
  getAepEdgeCookies,
} = require("aep-edge-samples-common/cookies");
const { sendResponse } = require("aep-edge-samples-common/utils");

const { EDGE_CONFIG_ID, ORGANIZATION_ID, demoDecisionScopeName, FPID, PORT } =
  process.env;

// Initialize the Express app
const app = express();

// Setup cookie parsing middleware and static file serving from the /public directory
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "..", "public")));

function prepareTemplateVariables({ response = {} }) {
  const { headers = {}, body = { handle: [] } } = response;

  return {
    demoDecisionScopeName,
    edgeConfigId: EDGE_CONFIG_ID,
    orgId: ORGANIZATION_ID,
    applyResponseParam: JSON.stringify(
      {
        renderDecisions: true,
        xdm: {
          web: {
            webPageDetails: {
              viewName: "home",
            },
          },
        },
        responseHeaders: headers,
        responseBody: {
          ...body,
          handle: body.handle.filter((item) => item.type !== TYPE_STATE_STORE),
        },
      },
      null,
      2
    ),
  };
}

// Setup the root route Express app request handler for GET requests
app.get("/", async (req, res) => {
  const aepEdgeClient = createAepEdgeClient(
    EDGE_CONFIG_ID,
    getAepEdgeClusterCookie(ORGANIZATION_ID, req)
  );

  const aepEdgeCookies = getAepEdgeCookies(req);

  const aepEdgeResult = await requestAepEdgePersonalization(
    aepEdgeClient,
    req,
    [demoDecisionScopeName],
    isString(FPID) && FPID.length > 0
      ? {
          FPID: [createIdentityPayload(FPID)],
        }
      : {},
    aepEdgeCookies
  );

  const template = loadHandlebarsTemplate("index", "server/src/templates");

  const templateVariables = prepareTemplateVariables(aepEdgeResult);

  const context = {
    req,
    res,
    template,
    templateVariables,
    aepEdgeResult,
  };

  saveAepEdgeCookies(ORGANIZATION_ID, context);
  sendResponse(context);
});

// Startup the Express server listener
app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));

// Stop the server on any app warnings
process.on("warning", (e) => {
  console.warn("Node application warning", e);
  process.exit(-1);
});
