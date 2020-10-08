import testServerUrl from "../constants/testServerUrl";
import createNetworkLogger from "../networkLogger";

const alloyEnv = process.env.ALLOY_ENV || "int";

const path = require("path");

const pageSnippetPath = path.join(__dirname, "..", "alloyPageSnippet/index.js");
const promisePolyfillPath = path.join(
  __dirname,
  "..",
  "promisePolyfill/promise-polyfill.min.js"
);
const alloyLibraryPath = path.join(__dirname, "../../../../", "dist/alloy.js");

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

  // Inject the Promise polyfill to control the priority of the code being injected.
  const clientScripts = [promisePolyfillPath];
  // We only inject scripts if we are not targeting Alloy PROD
  if (alloyEnv !== "prod") {
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
