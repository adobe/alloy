module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        },
        modules: "commonjs",
        shippedProposals: true
      }
    ]
  ],
  plugins: ["@babel/plugin-syntax-jsx"]
};
