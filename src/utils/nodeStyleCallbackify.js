import Promise from "@adobe/reactor-promise";
import { isFunction } from "./lodashLike";

/**
 * Turns a function into a node-style async function, where the result
 * is passed to a provided callback.
 * @param {Function} fn The underlying function that would be called when the
 * node-style async function is called.
 * @returns {Function} A function that receives a callback as the
 * last argument.
 */
export default fn => {
  return (...args) => {
    const callback = args.pop();

    if (!callback || !isFunction(callback)) {
      throw new Error("The last argument must be a callback function.");
    }

    // We have to wrap the function call in "new Promise()" instead of just
    // a "Promise.resolve()" so that the promise can capture any synchronous
    // errors that occur during the underlying function call.
    new Promise(resolve => {
      resolve(fn(...args));
    }).then(
      data => {
        callback(null, data);
      },
      error => {
        // TODO: Do we want to log the error here?
        // Only when debugging is enabled? If we don't log it at all,
        // and the user doesn't provide a callback, the error is essentially
        // swallowed.
        console.error(error);
        callback(error);
      }
    );
  };
};
