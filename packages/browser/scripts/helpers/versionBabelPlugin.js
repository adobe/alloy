/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createRequire } from "module";

const require = createRequire(import.meta.url);

const version = null;
const getVersion = ({ opts: { cwd } }) => {
  if (version) {
    return version;
  }

  const packageJson = require(`${cwd}/package.json`);
  return packageJson.version;
};

export default (_ref) => {
  const t = _ref.types;

  return {
    visitor: {
      // __VERSION__
      ReferencedIdentifier(path, state) {
        const identifier = state.opts.identifier;
        const transform = identifier === undefined ? true : identifier;

        const define = state.opts.define || "__VERSION__";
        if (transform && path.node.name === define) {
          path.replaceWith(t.valueToNode(getVersion(state)));
        }
      },
      // "__VERSION__"
      StringLiteral(path, state) {
        const stringLiteral = state.opts.stringLiteral;
        const transform = stringLiteral === undefined ? true : stringLiteral;

        const define = state.opts.define || "__VERSION__";
        if (transform && path.node.value === define) {
          path.replaceWith(t.valueToNode(getVersion(state)));
        }
      },
    },
  };
};
