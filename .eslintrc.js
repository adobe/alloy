module.exports = {
  extends: ["airbnb", "prettier", "plugin:testcafe/recommended"],
  env: {
    browser: true,
    node: true,
    jasmine: true
  },
  plugins: ["prettier", "testcafe"],
  rules: {
    "prettier/prettier": "error",
    "no-param-reassign": ["error", { props: false }],
    "func-style": "error",
    // Turning this off allows us to import devDependencies in our build tools.
    // We enable the rule in src/.eslintrc.js since that's the only place we
    // want to disallow importing extraneous dependencies.
    "import/no-extraneous-dependencies": "off"
  }
};
