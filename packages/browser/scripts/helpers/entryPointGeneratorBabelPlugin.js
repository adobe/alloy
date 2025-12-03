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

const COMPONENT_SOURCE = "@adobe/alloy-core/core/componentCreators.js";

const createComponentArrayExpression = (t, includedModules) => {
  return t.ArrayExpression(includedModules.map((module) => t.Identifier(module)));
};

const createComponentImport = (t, includedModules) => {
  if (!includedModules.length) {
    return null;
  }

  const specifiers = includedModules.map((module) =>
    t.importSpecifier(t.identifier(module), t.identifier(module)),
  );

  return t.importDeclaration(specifiers, t.stringLiteral(COMPONENT_SOURCE));
};

const removeOptionalComponentsImport = (path) => {
  const importPaths = path
    .get("body")
    .filter(
      (child) =>
        child.isImportDeclaration() &&
        child.node.source.value === COMPONENT_SOURCE,
    );

  importPaths.forEach((importPath) => {
    importPath.remove();
  });
};

const insertComponentImport = (path, importNode) => {
  if (!importNode) {
    return;
  }

  const importDeclarations = path
    .get("body")
    .filter((child) => child.isImportDeclaration());

  if (importDeclarations.length === 0) {
    path.unshiftContainer("body", importNode);
    return;
  }

  importDeclarations[importDeclarations.length - 1].insertAfter(importNode);
};

export default (t, includedModules) => ({
  visitor: {
    // rewrite the imports
    Program: {
      enter(path, state) {
        state.componentsArray = createComponentArrayExpression(t, includedModules);
        removeOptionalComponentsImport(path);
      },
      exit(path, state) {
        const importNode = createComponentImport(t, includedModules);
        insertComponentImport(path, importNode);
        state.componentsArray = null;
      },
    },
    // pass in the new, smaller components array to `initializeStandalone`
    CallExpression(path, state) {
      if (path.node.callee.name !== "initializeStandalone") {
        return;
      }

      const arrayExpression =
        state.componentsArray || createComponentArrayExpression(t, includedModules);

      path.replaceWith(
        t.CallExpression(t.Identifier("initializeStandalone"), [
          t.ObjectExpression([
            t.ObjectProperty(t.Identifier("components"), arrayExpression),
          ]),
        ]),
      );

      path.stop();
    },
  },
});
