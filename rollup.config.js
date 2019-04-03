/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";

export default {
  input: "src/core/main.js",
  output: [
    {
      file: "dist/alloy.js",
      format: "umd",
      // Allow non-IE browsers and IE10 and IE11
      // document.documentMode was added in IE8, and is specific to IE.
      // IE7 and lower are not ES5 compatible so will get a parse error loading the library.
      intro: "if (document.documentMode && document.documentMode < 10) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 9 and below.'); return; }"
    },
    {
      file: "sandbox/public/alloy.js",
      format: "umd",
      intro: "if (document.documentMode && document.documentMode < 10) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 9 and below.'); return; }"
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel()
  ]
};
