import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";

export default {
  input: "src/main.js",
  output: [
    {
      file: "dist/atag.js",
      format: "umd",
      name: "atag",
      // Allow non-IE browsers and IE10 and IE11
      // document.documentMode was added in IE8, and is specific to IE.
      // IE7 and lower are not ES5 compatible so will get a parse error loading the library.
      intro: "if (document.documentMode && document.documentMode < 10) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 9 and below.'); return; }"
    },
    {
      file: "sandbox/public/atag.js",
      format: "umd",
      name: "atag",
      intro: "if (document.documentMode && document.documentMode < 10) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 9 and below.'); return; }"
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel()
  ]
};
