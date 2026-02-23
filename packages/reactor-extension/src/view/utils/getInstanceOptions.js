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
 * For views where users must select a instance, this function generates
 * options values to be presented in a Select component. In addition to
 * showing an option for each instance available from the extension
 * configuration, it also provides an option, when necessary, to
 * represent the selection of an instance that previously existed.
 * @param {Object} initInfo Extension view initialization object which
 * comes from Reactor.
 * @returns {Array}
 */
export default (initInfo) => {
  // initInfo.extensionSettings.instances will always be defined and
  // be an array with at least one instance, except when we're testing
  // using the local sandbox tool where it might be undefined if we
  // haven't initialized the view with proper data. In that
  // case, we'll prefer showing an empty list of options instead of
  // throwing an error.
  const instances = initInfo.extensionSettings.instances || [];

  const instanceOptions = instances.map((instance) => ({
    value: instance.name,
    label: instance.name,
  }));

  if (initInfo.settings) {
    const previouslySavedInstanceName = initInfo.settings.instanceName;
    if (
      previouslySavedInstanceName &&
      !instanceOptions.some(
        (instanceOption) =>
          instanceOption.value === initInfo.settings.instanceName,
      )
    ) {
      instanceOptions.unshift({
        value: previouslySavedInstanceName,
        label: `${previouslySavedInstanceName} (Deleted)`,
        disabled: true,
      });
    }
  }

  return instanceOptions;
};
