/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export const generateEntryPointSource = (includedModules) => {
  const hasComponents = includedModules.length > 0;
  const componentList = includedModules.join(", ");

  const importLine = hasComponents
    ? `import { ${componentList} } from "./allOptionalComponents.js";`
    : "";

  const componentsArray = hasComponents ? `[${componentList}]` : "[]";

  return `\
import initializeStandalone from "./initializeStandalone.js";
${importLine}

initializeStandalone({ components: ${componentsArray} });
`;
};
