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

/**
 * Returns the first item in the array that satisfies the provided testing function.
 * @param {Array} arr The array to search.
 * @param {Function} predicate Function that will be called for each item. Arguments
 * will be the item, the item index, then the array itself.
 * @returns {*}
 */
export default (arr, predicate) => {
  for (let i = 0; i < arr.length; i += 1) {
    const item = arr[i];
    if (predicate(item, i, arr)) {
      return item;
    }
  }
  return undefined;
};
