import testServerUrl from "../constants/testServerUrl";
import createNetworkLogger from "../networkLogger";

const networkLogger = createNetworkLogger();

export default ({ title = "", url = testServerUrl, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks.concat(networkLogger.demdexProxy));
};
