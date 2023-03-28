import { TEST_PAGE as TEST_PAGE_URL } from "../constants/url";
import { getFixtureClientScripts } from "./clientScripts";
import destinationRequestMock from "./destinationRequestMock";

export default ({
  title = "",
  url = TEST_PAGE_URL,
  requestHooks = [],
  monitoringHooksScript,
  includeAlloyLibrary = true,
  includeVisitorLibrary = false,
  includeNpmLibrary = false
}) => {
  const clientScripts = getFixtureClientScripts({
    monitoringHooksScript,
    includeAlloyLibrary,
    includeVisitorLibrary,
    includeNpmLibrary
  });
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks, destinationRequestMock)
    .clientScripts(clientScripts);
};
