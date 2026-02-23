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

const clone = require("../../utils/clone");

module.exports =
  ({ instanceManager, sendEventCallbackStorage, getConfigOverrides }) =>
  (settings) => {
    const { instanceName, ...sendEventSettings } = settings;
    sendEventSettings.edgeConfigOverrides =
      getConfigOverrides(sendEventSettings);

    const instance = instanceManager.getInstance(instanceName);

    if (!instance) {
      throw new Error(
        `Failed to send event for instance "${instanceName}". No matching instance was configured with this name.`,
      );
    }

    // If the customer modifies the xdm or data object (or anything nested in the object) after this action runs,
    // we want to make sure those modifications are not reflected in the data sent to the server. By cloning the
    // objects here, we ensure we use a snapshot that will remain unchanged during the time period between when
    // sendEvent is called and the network request is made.
    if (sendEventSettings.xdm) {
      sendEventSettings.xdm = clone(sendEventSettings.xdm);
    }
    if (sendEventSettings.data) {
      sendEventSettings.data = clone(sendEventSettings.data);
    }

    return instance("sendEvent", sendEventSettings).then((result) => {
      sendEventCallbackStorage.triggerEvent(result);
    });
  };
