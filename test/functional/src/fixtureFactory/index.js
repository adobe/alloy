const edgeBasePath = `
    window.edgeBasePath = "${process.env.EDGE_ENV}";
`;

export default ({ title = "", url, requestHooks = [] }) => {
  return fixture(title)
    .page(url)
    .clientScripts({ content: edgeBasePath })
    .requestHooks(...requestHooks);
};
