module.exports = excludedModules => {
  return {
    visitor: {
      ImportDeclaration(path) {
        let skipWhenComments = [];
        if (path.node.leadingComments) {
          skipWhenComments = path.node.leadingComments.filter(c => {
            return c.value.trim().startsWith("@skipwhen");
          });
        }

        if (skipWhenComments.length > 0) {
          const [, webSDKModuleName, value] = skipWhenComments[0].value.match(
            "ENV.(.*) === (false|true)"
          );

          if (excludedModules[webSDKModuleName] === value) {
            const variableName = path.node.specifiers[0].local.name;

            // Wrap the variable declaration in an IIFE to turn it into an expression
            path.replaceWithSourceString(
              `(() => { const ${variableName} = () => {}; })()`
            );
          }
        }
      },
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type === "ArrayExpression") {
          path.node.declaration.elements = path.node.declaration.elements.filter(
            element => {
              if (element.name) {
                const variableName = element.name;
                const componentName = variableName
                  .replace("create", "")
                  .toLowerCase();
                return !Object.keys(excludedModules).includes(
                  `alloy_${componentName}`
                );
              }
              return true;
            }
          );
        }
      }
    }
  };
};