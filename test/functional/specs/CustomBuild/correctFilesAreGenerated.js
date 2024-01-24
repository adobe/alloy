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
const fs = require("fs");

test("Check if correct files are generated", async () => {
  exec("npm run build:custom", error => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    fs.access("dist/alloy.js", fs.constants.F_OK, err => {
      if (err) {
        console.error(`fs access error: ${err}`);
      }
    });
    fs.access("dist/alloy.min.js", fs.constants.F_OK, err => {
      if (err) {
        console.error(`fs access error: ${err}`);
      }
    });
  });
});
