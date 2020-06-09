import testServerUrl from "../constants/testServerUrl";
import createNetworkLogger from "../networkLogger";

const edgeEnv = process.env.EDGE_ENV || "int";
const alloyEnv = process.env.ALLOY_ENV;

const path = require("path");

const pageSnippetPath = path.join(__dirname, "..", "alloyPageSnippet/index.js");
const alloyLibraryPath = path.join(
  __dirname,
  "../../../../",
  "dist/standalone/alloy.js"
);

const networkLogger = createNetworkLogger();

export default ({
  title = "",
  url = testServerUrl,
  requestHooks = [],
  includeAlloyLibrary = true
}) => {
  const fixtureObject = fixture(title)
    .page(url)
    .requestHooks(...requestHooks.concat(networkLogger.demdexProxy));

  const clientScripts = [];
  if (edgeEnv === "int" && alloyEnv !== "prod") {
    clientScripts.push({
      path: pageSnippetPath
    });
    if (includeAlloyLibrary) {
      clientScripts.push({
        path: alloyLibraryPath
      });
    }
    fixtureObject.clientScripts(clientScripts);
  }

  return fixtureObject;
};
