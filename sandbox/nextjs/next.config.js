const withTM = require("next-transpile-modules")([
  "react-syntax-highlighter",
  "@adobe/alloy"
]);

module.exports = withTM({});
