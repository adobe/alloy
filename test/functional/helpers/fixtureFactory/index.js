const edgeEnv = process.env.EDGE_ENV || "";
const edgeBasePath = `window.edgeBasePath = ${edgeEnv};`;

export default ({ title = "", url, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .clientScripts({ content: edgeBasePath })
    .requestHooks(...requestHooks);
};
