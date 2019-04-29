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

(function(window, instanceNames) {
  instanceNames.forEach(function(instanceNamespace) {
    if (!window[instanceNamespace]) {
      (window.__alloyNS = window.__alloyNS || []).push(instanceNamespace);
      window[instanceNamespace] = function() {
        var userProvidedArgs = arguments;
        return new Promise(function(resolve, reject) {
          window[instanceNamespace].q.push([resolve, reject, userProvidedArgs]);
        });
      };
      window[instanceNamespace].q = [];
    }
  });
})(window, ["alloy"]);
