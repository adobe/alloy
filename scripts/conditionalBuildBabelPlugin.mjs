export default (excludedModules, t) => {
  return {
    visitor: {
      ImportDeclaration(path) {
        // Search for the comments that start with the `@skipwhen` directive.
        const skipWhenComments =
          path.node.leadingComments?.filter((c) => {
            return c.value.trim().startsWith("@skipwhen");
          }) || [];

        if (skipWhenComments.length > 0) {
          const [, webSDKModuleName, value] = skipWhenComments[0].value.match(
            "ENV.(.*) === (false|true)"
          );

          if (excludedModules[webSDKModuleName] === value) {
            const variableName = path.node.specifiers[0].local.name;

            path.replaceWithSourceString(`const ${variableName} = null;`);
          }
        }
      }
    }
  };
};