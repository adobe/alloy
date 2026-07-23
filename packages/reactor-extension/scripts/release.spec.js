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

import { describe, expect, test } from "vitest";
import { isAlreadyReleasedError } from "./release.mjs";

// Captured verbatim from https://github.com/adobe/alloy/actions/runs/29958621025/job/89057883911
const CAPTURED_ALREADY_RELEASED_OUTPUT = `No development extension package was found on the server with the name adobe-alloy. A new extension package will be created.
ERROR
Failed to POST the extension package to the server.
No extension package ID was returned from the API.
--verbose output
/home/runner/work/alloy/alloy/node_modules/.pnpm/@adobe+reactor-uploader@6.0.2_@types+node@25.6.2/node_modules/@adobe/reactor-uploader/bin/handleResponseError.js:36
  throw new Error(messagePrefix + ' ' + message);
        ^

Error: Error uploading extension package. {"stack":"Error: {\\"errors\\":[{\\"id\\":\\"df1cc5c1-b84a-48d1-befe-287c63dac60b\\",\\"code\\":\\"invalid-version\\",\\"title\\":\\"Invalid version\\",\\"detail\\":\\"2.37.1.pre.beta.4 is older than latest version: 2.37.1.pre.beta.4\\",\\"meta\\":{\\"request_id\\":\\"a3ba7103-0639-4859-ba1f-6472b5e81aff\\"},\\"source\\":{\\"pointer\\":\\"/data/attributes/version\\"}}]}\\n    at module.exports (/home/runner/work/alloy/alloy/node_modules/.pnpm/@adobe+reactor-uploader@6.0.2_@types+node@25.6.2/node_modules/@adobe/reactor-uploader/bin/uploadZip.js:63:32)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at async /home/runner/work/alloy/alloy/node_modules/.pnpm/@adobe+reactor-uploader@6.0.2_@types+node@25.6.2/node_modules/@adobe/reactor-uploader/bin/index.js:97:32","message":"{\\"errors\\":[{\\"id\\":\\"df1cc5c1-b84a-48d1-befe-287c63dac60b\\",\\"code\\":\\"invalid-version\\",\\"title\\":\\"Invalid version\\",\\"detail\\":\\"2.37.1.pre.beta.4 is older than latest version: 2.37.1.pre.beta.4\\",\\"meta\\":{\\"request_id\\":\\"a3ba7103-0639-4859-ba1f-6472b5e81aff\\"},\\"source\\":{\\"pointer\\":\\"/data/attributes/version\\"}}]}"}.
    at module.exports (/home/runner/work/alloy/alloy/node_modules/.pnpm/@adobe+reactor-uploader@6.0.2_@types+node@25.6.2/node_modules/@adobe/reactor-uploader/bin/handleResponseError.js:36:9)
    at module.exports (/home/runner/work/alloy/alloy/node_modules/.pnpm/@adobe+reactor-uploader@6.0.2_@types+node@25.6.2/node_modules/@adobe/reactor-uploader/bin/uploadZip.js:84:5)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async /home/runner/work/alloy/alloy/node_modules/.pnpm/@adobe+reactor-uploader@6.0.2_@types+node@25.6.2/node_modules/@adobe/reactor-uploader/bin/index.js:97:32

Node.js v24.18.0`;

describe("isAlreadyReleasedError()", () => {
  test("recognizes the exact output captured from a real already-released failure", () => {
    expect(isAlreadyReleasedError(CAPTURED_ALREADY_RELEASED_OUTPUT)).toBe(true);
  });

  test("recognizes the unescaped, single-stringified shape too", () => {
    const output =
      '{"errors":[{"code":"invalid-version","detail":"2.37.1.pre.beta.4 is older than latest version: 2.37.1.pre.beta.4"}]}';
    expect(isAlreadyReleasedError(output)).toBe(true);
  });

  test("does not treat a genuinely older version as already-released", () => {
    const output =
      '{"errors":[{"code":"invalid-version","detail":"2.37.0 is older than latest version: 2.37.1.pre.beta.4"}]}';
    expect(isAlreadyReleasedError(output)).toBe(false);
  });

  test("does not match unrelated errors", () => {
    const output = "Error: connect ETIMEDOUT 1.2.3.4:443";
    expect(isAlreadyReleasedError(output)).toBe(false);
  });

  test("requires the invalid-version code, not just matching wording", () => {
    const output =
      '{"errors":[{"code":"some-other-code","detail":"2.37.1.pre.beta.4 is older than latest version: 2.37.1.pre.beta.4"}]}';
    expect(isAlreadyReleasedError(output)).toBe(false);
  });
});
