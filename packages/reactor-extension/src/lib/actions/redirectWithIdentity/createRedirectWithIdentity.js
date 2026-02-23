/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
module.exports =
  ({ instanceManager, window, logger, getConfigOverrides }) =>
  (settings, event) => {
    const { instanceName } = settings;
    const instance = instanceManager.getInstance(instanceName);

    if (!instance) {
      logger.warn(
        `Instance "${instanceName}" not found when running "Redirect with identity."`,
      );
      return Promise.resolve();
    }

    if (!event || !event.element) {
      logger.warn(
        `Clicked element not found when running "Redirect with identity." This action is meant to be used with a Core click event.`,
      );
      return Promise.resolve();
    }

    if (!event.element.href) {
      logger.warn(
        `Invalid event target when running "Redirect with identity." This action is meant to be used with a Core click event using an "a[href]" selector.`,
      );
      return Promise.resolve();
    }

    if (event.nativeEvent.preventDefault) {
      event.nativeEvent.preventDefault();
    }

    const url = event.element.href;
    const edgeConfigOverrides = getConfigOverrides(settings);
    const target = event.element.target || "_self";

    return instance("appendIdentityToUrl", {
      url,
      edgeConfigOverrides,
    }).then(({ url: newLocation }) => {
      window.open(newLocation, target);
    });
  };
