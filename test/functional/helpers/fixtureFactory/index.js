import testServerUrl from "../constants/testServerUrl";
import createNetworkLogger from "../networkLogger";

const networkLogger = createNetworkLogger();

// TODO: Switch to a different page for PROD testing.
const defaultUrl = `${testServerUrl}/alloyTestPage.html`;

export default ({ title = "", url = defaultUrl, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks.concat(networkLogger.demdexProxy));
};
