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
