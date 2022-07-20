var path = require("path");

module.exports = {
  context: path.join(__dirname, "./"),
  entry: "./client/src/index.js",
  output: {
    path: path.join(__dirname, "server", "public", "assets"),
    filename: "js/app.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015", "react", "env"],
        },
      },
      {
        test: /\.(jpg|jpeg|gif|png)$/,
        exclude: /node_modules/,
        loader: "url-loader?limit=1024&name=images/[name].[ext]",
      },
    ],
  },
};
