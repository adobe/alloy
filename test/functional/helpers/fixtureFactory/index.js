import testServerUrl from "../constants/testServerUrl";

// TODO: Switch to a different page for PROD testing.
const defaultUrl = `${testServerUrl}/alloyTestPage.html`;

export default ({ title = "", url = defaultUrl, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .requestHooks(...requestHooks);
};
