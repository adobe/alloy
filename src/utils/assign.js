/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// import assign from "@adobe/reactor-object-assign";

// NOTE: I am changing this because the previously referenced object-assign npm
// package hasn't been updated in 5 years.  It used to run a bunch of checks to
// ensure that Object.assign acted correctly, but those bugs have been fixed.

const getOwnPropertySymbols = Object.getOwnPropertySymbols;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const propIsEnumerable = Object.prototype.propertyIsEnumerable;

const toObject = val => {
  if (val === null || val === undefined) {
    throw new TypeError(
      "Object.assign cannot be called with null or undefined"
    );
  }

  return Object(val);
};

const assign =
  Object.assign ||
  function assign(target, ...sources) {
    let from;
    const to = toObject(target);
    let symbols;

    // loop through each source
    for (let i = 0, il = sources.length; i < il; i += 1) {
      from = Object(sources[i]);

      // copy over own properties
      // eslint-disable-next-line no-restricted-syntax
      for (const key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }

      // if getOwnPropertySymbols is supported...
      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);

        // copy over own symbol properties
        for (let j = 0, jl = symbols.length; j < jl; j += 1) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[j]] = from[symbols[j]];
          }
        }
      }
    }

    return to;
  };

export default assign;
