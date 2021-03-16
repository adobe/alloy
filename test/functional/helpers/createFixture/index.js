import testPageUrl from "../constants/testPageUrl";
import { getFixtureClientScripts } from "./clientScripts";
import destinationRequestMock from "./destinationRequestMock";

export default ({
  title = "",
  url = testPageUrl,
  requestHooks = [],
  includeAlloyLibrary = true,
  includeVisitorLibrary = false,
  includeNpmLibrary = false
}) => {
  const clientScripts = getFixtureClientScripts({
    includeAlloyLibrary,
    includeVisitorLibrary,
    includeNpmLibrary
  });
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks, destinationRequestMock)
    .clientScripts(clientScripts);
};
