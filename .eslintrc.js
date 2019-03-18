module.exports = {
  "extends": [
    "airbnb",
    "prettier",
    "plugin:testcafe/recommended"
  ],
  "env": {
    "browser": true,
    "node": true,
    "jasmine": true
  },
  "plugins": [
    "prettier",
    "testcafe"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
};
