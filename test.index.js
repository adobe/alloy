const testsContext = require.context('./test', true, /.*\.spec\.jsx?$/);
testsContext.keys().forEach(testsContext);

// This is necessary for the coverage report to show all source files even when they're not
// included by tests. https://github.com/webpack-contrib/istanbul-instrumenter-loader/issues/15
const srcContext = require.context('./src', true, /.*\.jsx?$/);
srcContext.keys().forEach(srcContext);
