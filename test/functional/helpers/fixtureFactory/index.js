import testServerUrl from "../constants/testServerUrl";

const edgeEnv = process.env.EDGE_ENV || "";
const edgeBasePath = `window.edgeBasePath = ${edgeEnv};`;
const defaultUrl = `${testServerUrl}/alloyTestPage.html`;

export default ({ title = "", url = defaultUrl, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .clientScripts({ content: edgeBasePath })
    .requestHooks(...requestHooks);
};
