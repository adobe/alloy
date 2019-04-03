const path = require("path");

module.exports = {
  mode: "development",
  devtool: "#inline-source-map",
  resolve: {
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        include: [path.resolve("src"), path.resolve("test")],
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
      {
        include: [path.resolve("src")],
        use: [
          {
            loader: "istanbul-instrumenter-loader",
            options: {
              esModules: true
            }
          }
        ]
      }
    ]
  }
};
