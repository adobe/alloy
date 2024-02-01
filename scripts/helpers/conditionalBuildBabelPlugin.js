/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
