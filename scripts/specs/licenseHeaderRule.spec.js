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

import { RuleTester } from "eslint";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "vitest";
import alloyPlugin from "../eslint/eslintLicensePlugin.js";

RuleTester.afterAll = afterAll;
RuleTester.afterEach = afterEach;
RuleTester.beforeAll = beforeAll;
RuleTester.beforeEach = beforeEach;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

const rule = alloyPlugin.rules["license-header"];

const HEADER_2000 = `/*
Copyright 2000 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/`;

ruleTester.run("license-header", rule, {
  valid: [
    {
      code: `${HEADER_2000}\n\nimport foo from "foo";`,
      options: [{ year: 2000 }],
    },
    {
      code: `#!/usr/bin/env node\n\n${HEADER_2000}\n\nconsole.log("hi");`,
      options: [{ year: 2000 }],
    },
    // Some historical files omit the blank line after the License URL.
    {
      code: `/*
Copyright 2000 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/\n\nexport default 1;`,
    },
  ],
  invalid: [
    {
      code: `import foo from "foo";`,
      options: [{ year: 2000 }],
      errors: [{ messageId: "missing" }],
      output: `${HEADER_2000}\n\nimport foo from "foo";`,
    },
    {
      code: `/* eslint-disable no-console */\nconsole.log("hi");`,
      options: [{ year: 2000 }],
      errors: [{ messageId: "missing" }],
      output: `${HEADER_2000}\n\n/* eslint-disable no-console */\nconsole.log("hi");`,
    },
    {
      code: `#!/usr/bin/env node\n\nconsole.log("hi");`,
      options: [{ year: 2000 }],
      errors: [{ messageId: "missing" }],
      output: `#!/usr/bin/env node\n\n${HEADER_2000}\n\nconsole.log("hi");`,
    },
  ],
});
