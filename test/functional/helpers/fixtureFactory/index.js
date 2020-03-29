import testServer from "../constants/testServer";
import createNetworkLogger from "../networkLogger";

const networkLogger = createNetworkLogger();

const defaultUrl = `${testServer.domain}/${testServer.page}`;

export default ({ title = "", url = defaultUrl, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks.concat(networkLogger.demdexProxy));
};
