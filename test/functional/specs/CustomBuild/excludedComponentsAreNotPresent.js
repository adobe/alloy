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
const { exec } = require("child_process");
const expect = require("chai").expect;
const fs = require("fs");

test("Check if excluded components are not present", async () => {
  const componentToExclude = "personalization";

  exec(
    `npm run build:custom -- --exclude ${componentToExclude}`,
    // eslint-disable-next-line no-unused-vars
    (error, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      fs.readFile("dist/alloy.js", "utf8", (err, data) => {
        if (err) {
          console.error(`readFile error: ${err}`);
          return;
        }
        expect(data).not.to.include(`alloy_${componentToExclude}`);
      });
    }
  );
});
