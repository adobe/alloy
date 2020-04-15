import testServerUrl from "../constants/testServerUrl";
import createNetworkLogger from "../networkLogger";

const env = process.env.EDGE_ENV || "int";

const path = require("path");

const pageSnippetPath = path.join(
  __dirname,
  "..",
  "alloyPageSnippet/action.js"
);
const alloyLibraryPath = path.join(
  __dirname,
  "../../../../",
  "dist/standalone/alloy.js"
);

const networkLogger = createNetworkLogger();

export default ({ title = "", url = testServerUrl, requestHooks = [] }) => {
  const fixtureObject = fixture(title)
    .page(url)
    .requestHooks(...requestHooks.concat(networkLogger.demdexProxy));

  if (env === "int") {
    fixtureObject.clientScripts([
      {
        path: pageSnippetPath
      },
      {
        path: alloyLibraryPath
      }
    ]);
  }

  return fixtureObject;
};
