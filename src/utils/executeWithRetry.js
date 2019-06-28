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
 * Executes a function that returns promise. If the promise is rejected, the
 * function will executed again. This will process continue until a promise
 * returned from the function successfully resolves or the maximum number
 * of retries has been reached.
 * @param {Function} fn A function which returns a promise.
 * @param {number} [maxRetries=3] The max number of retries.
 */
export default (fn, maxRetries = 3) => {
  let retryCount = 0;
  const execute = () => {
    return fn().catch(e => {
      if (retryCount < maxRetries) {
        retryCount += 1;
        return execute();
      }

      throw e;
    });
  };

  return execute();
};
