/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Verifies user provided event options.
 * @param {*} options The user event options to validate
 * @returns {Array} Array of warnings if the options are invalid
 */
export default options => {
  const warnings = [];
  const { xdm } = options;
  if (!xdm && !options.data) {
    warnings.push("No event xdm or event data specified.");
  } else if (xdm && !xdm.eventType && !options.type) {
    warnings.push("No type or xdm.eventType specified.");
  }
  return warnings;
};
