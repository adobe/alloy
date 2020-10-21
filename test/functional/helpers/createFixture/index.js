import testPageUrl from "../constants/testPageUrl";
import createNetworkLogger from "../networkLogger";
import { getFixtureClientScripts } from "./clientScripts";

const networkLogger = createNetworkLogger();

export default ({
  title = "",
  url = testPageUrl,
  requestHooks = [],
  includeAlloyLibrary = true,
  includeVisitorLibrary = false
}) => {
  const clientScripts = getFixtureClientScripts({
    includeAlloyLibrary,
    includeVisitorLibrary
  });
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks.concat(networkLogger.demdexProxy))
    .clientScripts(clientScripts);
};
