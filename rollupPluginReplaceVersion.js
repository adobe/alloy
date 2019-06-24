import replace from "rollup-plugin-replace";

const { version } = require("./package.json");

export default () =>
  replace({
    delimiters: ["{{", "}}"],
    values: {
      version
    }
  });
