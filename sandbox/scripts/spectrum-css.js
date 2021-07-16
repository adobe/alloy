/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fs = require("fs");
const large = require.resolve("@spectrum-css/vars/dist/spectrum-large.css");
const icon = require.resolve("@spectrum-css/icon/dist/index-vars.css");
const MOBILE_SCREEN_WIDTH = require("../conf/globals").MOBILE_SCREEN_WIDTH;

const wrap = (file, identifier, wrapper) => {
  try {
    const content = fs.readFileSync(file, "utf8");

    if (content.startsWith(identifier)) {
      fs.writeFileSync(file, wrapper(content), "utf8");
    } else {
      let applyWrapper = false;
      fs.writeFileSync(
        file,
        content
          .split("\n")
          .map(line => {
            if (line.startsWith(identifier)) {
              applyWrapper = true;
              return wrapper(line);
            } else if (applyWrapper && line.includes("}")) {
              applyWrapper = false;
              return `${line}}`;
            }

            return line;
          })
          .join("\n"),
        "utf-8"
      );
    }
  } catch (e) {}
};

wrap(
  large,
  ".spectrum--large {",
  content =>
    `@media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {${content}}`
);
wrap(
  icon,
  ".spectrum--large",
  content => `@media screen and (max-width: ${MOBILE_SCREEN_WIDTH}) {${content}`
);
