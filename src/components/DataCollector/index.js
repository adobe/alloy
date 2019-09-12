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

import createEvent from "./createEvent";
import { clone } from "../../utils";
import createClickActivityCollector from "./activity/click";
import { required, validDomain } from "../../utils/configValidators";

const createDataCollector = ({ config, logger }) => {
  const { imsOrgId } = config;
  let lifecycle;
  let network;
  let optIn;

  const makeServerCall = (event, documentUnloading) => {
    const payload = network.createPayload();
    payload.addEvent(event);
    payload.mergeMeta({
      gateway: {
        imsOrgId
      }
    });

    return lifecycle
      .onBeforeDataCollection({ payload })
      .then(() => {
        return network.sendRequest(
          payload,
          payload.expectsResponse,
          documentUnloading
        );
      })
      .then(response => {
        const data = {
          requestBody: clone(payload)
        };

        if (response) {
          data.responseBody = clone(response);
        }

        return data;
      });
  };

  const createEventHandler = options => {
    const event = createEvent();
    const { viewStart = false, documentUnloading = false, xdm, data } = options;

    return lifecycle
      .onBeforeEvent({
        event,
        options,
        isViewStart: viewStart,
        isDocumentUnloading: documentUnloading
      })
      .then(() => {
        // We merge the user's data after onBeforeEvent so that
        // it overlays on top of any data Alloy automatically
        // provides. This allows the user to override the
        // automatically collected data.
        event.mergeXdm(xdm);
        event.data = data;
        return optIn.whenOptedIn();
      })
      .then(() => makeServerCall(event, documentUnloading));
  };

  createClickActivityCollector(config, logger, createEventHandler);

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, network, optIn } = tools);
      }
    },
    commands: {
      event: createEventHandler
    }
  };
};

createDataCollector.namespace = "DataCollector";
createDataCollector.abbreviation = "DC";
createDataCollector.configValidators = {
  propertyId: {
    validate: required
  },
  edgeDomain: {
    validate: validDomain,
    defaultValue: "alpha.konductor.adobedc.net"
  },
  imsOrgId: {
    validate: required
  },
  clickCollectionEnabled: {
    defaultValue: true
  }
};

export default createDataCollector;
