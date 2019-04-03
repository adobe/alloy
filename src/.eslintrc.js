module.exports = {
  rules: {
    // The eslintrc in the base directory turns this rule off.
    // We want to turn it back on for the src directory.
    "import/no-extraneous-dependencies": "error"
  }
};
