/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const assert = require("chai").assert;

test("Check if build works with different configurations", async () => {
  const { error, stderr } = await exec(
    "npm run build:custom -- --environment BASE_CODE_MIN,STANDALONE,STANDALONE_MIN"
  );
  assert.isNull(error);
  assert.isEmpty(stderr);
});
