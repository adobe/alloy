/* eslint-disable no-underscore-dangle */
const { Nothing, isNothing } = require("nothing-mock");

const win = typeof window !== "undefined" ? window : Nothing;
const doc = typeof document !== "undefined" ? document : Nothing;
const monitors =
  typeof win.__alloyMonitors !== "undefined" ? win.__alloyMonitors : Nothing;

module.exports.window = win;
module.exports.document = doc;
module.exports.__alloyMonitors = monitors;
module.exports.exists = variable => !isNothing(variable);
