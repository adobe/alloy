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

/* eslint no-param-reassign: 0 */
/* eslint no-underscore-dangle: 0 */
/* eslint prefer-rest-params: 0 */
/* eslint no-var: 0 */
/* eslint-disable func-names */

/**
 * This is the code, once minified, that an Alloy consumer copies and pastes
 * into their website's HTML. It sets up any global functions the consumer will
 * use to interact with Alloy. It also provides a queuing mechanism whereby
 * any function calls made by the consumer before the Alloy library file
 * loads will be enqueued and later processed by Alloy once the Alloy library
 * file has loaded. Because each call may be asynchronously processed, a promise
 * will always be returned to the consumer any time the consumer attempts to
 * execute a command.
 *
 * Along with this base code, a script tag (not shown here) will also be added
 * to the consumer website's HTML that will load the Alloy library file.
 *
 * Take particular care to write well-minifiable code, as consumers are
 * particularly sensitive to base code size.
 */

(function(window, instanceNames) {
  instanceNames.forEach(function(instanceName) {
    if (!window[instanceName]) {
      // __alloyNS stores a name of each "instance", or in other words, each
      // global function created that the consumer will use. This array is
      // what the Alloy library will consult once it is loaded to determine
      // which global functions have been set up so that is can connect them to
      // the library's command processing pipeline.
      window.__alloyNS = window.__alloyNS || [];
      window.__alloyNS.push(instanceName);
      window[instanceName] = function() {
        var userProvidedArgs = arguments;
        // Always return a promise, because the command may be executed
        // asynchronously, especially if the Alloy library has not yet loaded.
        return new Promise(function(resolve, reject) {
          // Push required call information into the queue. Once the Alloy
          // library is loaded, it will process this queue and resolve/reject
          // the promise we just returned to the consumer. If the Alloy
          // library has already loaded, then it will have already overridden
          // q.push and will therefore process the call immediately.
          window[instanceName].q.push([resolve, reject, userProvidedArgs]);
        });
      };
      window[instanceName].q = [];
    }
  });
})(window, ["alloy"]);
