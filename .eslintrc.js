module.exports = {
  extends: ["airbnb-base", "prettier", "plugin:testcafe/recommended"],
  env: {
    browser: true,
    node: true,
    jasmine: true
  },
  plugins: ["ban", "prettier", "testcafe"],
  rules: {
    "ban/ban": [
      "error",
      { name: ["describe", "only"], message: "don't focus tests" },
      { name: "fdescribe", message: "don't focus tests" },
      { name: ["it", "only"], message: "don't focus tests" },
      { name: "fit", message: "don't focus tests" },
      { name: ["fixture", "only"], message: "don't focus tests" },
      { name: ["test", "only"], message: "don't focus tests" },
      { name: "ftest", message: "don't focus tests" }
    ],
    "prettier/prettier": "error",
    "no-param-reassign": ["error", { props: false }],
    "func-style": "error",
    // Turning this off allows us to import devDependencies in our build tools.
    // We enable the rule in src/.eslintrc.js since that's the only place we
    // want to disallow importing extraneous dependencies.
    "import/no-extraneous-dependencies": "off",
    "prefer-destructuring": "off",
    "import/prefer-default-export": "off",
    // Make rules about importing between the top level folders
    // core can import from components, utils, and constants
    // components can import from utils, and constants
    // utils can import from constants
    "import/no-restricted-paths": [
      "error",
      {
        zones: [
          {
            from: "./src/core",
            target: "./src/components"
          },
          {
            from: "./src/core",
            target: "./src/utils"
          },
          {
            from: "./src/core",
            target: "./src/constants"
          },
          {
            from: "./src/components",
            target: "./src/utils"
          },
          {
            from: "./src/components",
            target: "./src/constants"
          },
          {
            from: "./src/utils",
            target: "./src/constants"
          }
        ]
      }
    ]
  },
  globals: {
    expectAsync: "readonly", // newer jasmine feature
    spyOnAllFunctions: "readonly" // newer jasmine feature
  }
};
