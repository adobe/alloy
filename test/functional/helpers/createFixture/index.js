import testPageUrl from "../constants/testPageUrl";
import { getFixtureClientScripts } from "./clientScripts";

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
    .requestHooks(...requestHooks)
    .clientScripts(clientScripts);
};
